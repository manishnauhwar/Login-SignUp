import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import Main from "../Title/Main";
import { logout } from "../../utils/auth";
import { useDrop } from "react-dnd";
import TaskCards from "./TaskCards";
import CalendarView from "./CalendarView";
import { ThemeContext } from "../../utils/ThemeContext";
import "./KanbanBoard.css";
import axiosInstance from "../../utils/axiosInstance";

const KanbanBoard = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [newTaskData, setNewTaskData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Low",
    status: "pending",
    createdAt: new Date().toISOString().split("T")[0],
    assignedTo: "",
    completionTime: "",
    timeElapsed: 0
  });
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState("kanban");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUserRole(userData.role);
      setUserId(userData._id || userData.id);
    }
  }, []);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (userRole === 'manager') {
        try {
          const response = await axiosInstance.get('/teams');
          const teams = response.data;
          const userTeam = teams.find(team => team.manager._id === userId);
          if (userTeam) {
            setTeamMembers(userTeam.members.map(member => member._id));
          }
        } catch (error) {
          console.error('Error fetching team members:', error);
        }
      }
    };

    if (userId && userRole) {
      fetchTeamMembers();
    }
  }, [userId, userRole]);

  const fetchTasks = async () => {
    try {
      const response = await axiosInstance.get("/tasks");
      const data = response.data || [];
      const userData = JSON.parse(localStorage.getItem("user"));
      const userId = userData._id || userData.id;

      const transformedTasks = data.map(task => ({
        _id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: new Date(task.dueDate).toISOString().split('T')[0],
        createdAt: new Date(task.createdAt).toISOString().split('T')[0],
        assignedTo: task.assignedTo || '',
        userId: task.userId
      }));

      let filteredTasks = transformedTasks;
      if (userRole === "user") {
        filteredTasks = transformedTasks.filter(task =>
          task.assignedTo === userId || task.userId === userId
        );
      } else if (userRole === "manager") {
        filteredTasks = transformedTasks.filter(task =>
          task.assignedTo === userId || task.userId === userId || teamMembers.includes(task.assignedTo)
        );
      }

      setAllTasks(filteredTasks);
      setTasks(filteredTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    if (userId && userRole) {
      fetchTasks();
    }
  }, [userId, userRole, teamMembers]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setTasks(allTasks);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = allTasks.filter(task =>
        task.title.toLowerCase().includes(lowercaseQuery) ||
        task.description.toLowerCase().includes(lowercaseQuery) ||
        task.priority.toLowerCase().includes(lowercaseQuery)
      );
      setTasks(filtered);
    }
  }, [searchQuery, allTasks]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const moveTask = async (taskId, newStatus) => {
    try {
      const task = tasks.find(task => task._id === taskId);
      if (!task) {
        console.error("Task not found");
        return;
      }

      if (userRole === "admin" || userRole === "manager") {
        await axiosInstance.patch(`/tasks/${taskId}`, { status: newStatus });
        fetchTasks();
      } else if (task.assignedTo === userId || task.userId === userId) {
        await axiosInstance.patch(`/tasks/${taskId}`, { status: newStatus });
        fetchTasks();
      } else {
        console.error("User is not authorized to modify this task");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  const addTask = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData._id || userData.id;
    const taskData = {
      title: newTaskData.title.trim(),
      description: newTaskData.description.trim() || "No description provided",
      dueDate: newTaskData.dueDate,
      priority: newTaskData.priority,
      status: "To Do",
      createdAt: new Date().toISOString(),
      assignedTo: userRole === "user" ? userId : newTaskData.assignedTo || userId,
      userId: userId
    };

    try {
      const response = await axiosInstance.post("/tasks/post", taskData);
      if (response.data) {
        fetchTasks();
        setShowModal(false);
        setNewTaskData({
          title: "",
          description: "",
          dueDate: "",
          priority: "Low",
          status: "To Do",
          createdAt: new Date().toISOString().split("T")[0],
          assignedTo: "",
          completionTime: "",
          timeElapsed: 0
        });
      }
    } catch (error) {
      console.error("Error adding task:", error);
      alert(error.response?.data?.message || "Failed to add task. Please try again.");
    }
  };

  const Column = ({ title, statusFilter }) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: "TASK",
      drop: (item) => {
        moveTask(item._id, statusFilter);
      },
      collect: (monitor) => ({ isOver: !!monitor.isOver() }),
    }));

    const filteredTasks = tasks.filter((task) => task.status === statusFilter).reverse();

    return (
      <div className={`column ${isOver ? 'column-over' : ''}`} ref={drop}>
        <h3>{title}</h3>
        <div className="task-card-container">
          {filteredTasks.map((task) => (
            <TaskCards key={task._id} task={task} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="home-container" data-theme={theme}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`} data-theme={theme}>
        <Navbar
          handleLogout={handleLogout}
          isSidebarOpen={isSidebarOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <Main />
        <div className="kanban-content">
          <div className="view-toggle">
            <button onClick={() => setView("kanban")}>Kanban</button>
            <button onClick={() => setView("calendar")}>Calendar</button>
            <button className="add-task-btn" onClick={() => setShowModal(true)}>+ Add Task</button>
          </div>
          {view === "kanban" && (
            <>
              <div className="boardContainer">
                <Column title="To Do" statusFilter="To Do" />
                <Column title="In Progress" statusFilter="In progress" />
                <Column title="Done" statusFilter="Completed" />
              </div>
            </>
          )}
        </div>
        {view === "calendar" && (
          <CalendarView tasks={tasks} setFilterDate={setFilterDate} filterDate={filterDate} onClose={() => setView("kanban")} />
        )}
        {showModal && (
          <div className="modal">
            <input type="text" placeholder="Title" value={newTaskData.title} onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })} />
            <textarea placeholder="Description" value={newTaskData.description} onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}></textarea>
            <input type="date" value={newTaskData.dueDate} onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })} />
            <select value={newTaskData.priority} onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <button onClick={addTask}>Add Task</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;
