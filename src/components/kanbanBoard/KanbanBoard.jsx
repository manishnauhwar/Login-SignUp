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
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [newTaskData, setNewTaskData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
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
      setUserId(userData.id);
    }
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axiosInstance.get("/tasks");
        const allTasksData = response.data;

        if (userRole === "user") {
          const userTasks = allTasksData.filter(task => task.assignedTo === userId);
          setTasks(userTasks);
        } else {
          setTasks(allTasksData);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, [userRole, userId]);

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
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId ? { ...task, status: newStatus } : task
          )
        );
        return;
      }

      if (task.assignedTo === userId || task.userId === userId) {
        await axiosInstance.patch(`/tasks/${taskId}`, { status: newStatus });
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId ? { ...task, status: newStatus } : task
          )
        );
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
    if (!newTaskData.title.trim() || !newTaskData.dueDate.trim()) return;

    const [year, month, day] = newTaskData.dueDate.split('-');
    const formattedDate = `${day}-${month}-${year}`;

    const taskData = {
      ...newTaskData,
      dueDate: formattedDate,
      status: "To Do",
      createdAt: new Date().toISOString().split("T")[0],
      assignedTo: userRole === "user" ? userId : newTaskData.assignedTo
    };

    try {
      const response = await axiosInstance.post("/tasks/post", taskData);
      if (response.data) {
        setTasks((prev) => [...prev, response.data]);
        setShowModal(false);
        setNewTaskData({
          title: "",
          description: "",
          dueDate: "",
          priority: "Medium",
          status: "To Do",
          createdAt: new Date().toISOString().split("T")[0],
          assignedTo: "",
          completionTime: "",
          timeElapsed: 0
        });
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const Column = ({ title, statusFilter }) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: "TASK",
      drop: (item) => {
        console.log('Dropping task:', item);
        moveTask(item._id, statusFilter);
      },
      collect: (monitor) => ({ isOver: !!monitor.isOver() }),
    }));

    const filteredTasks = tasks.filter((task) => {
      const statusMatch = task.status === statusFilter;
      if (userRole === "user") {
        return statusMatch && task.assignedTo === userId;
      }
      return statusMatch;
    });

    return (
      <div className={`column ${isOver ? 'column-over' : ''}`} ref={drop}>
        <h3>{title}</h3>
        {filteredTasks.map((task) => (
          <TaskCards key={task._id} task={task} />
        ))}
      </div>
    );
  };

  return (
    <div className="home-container" data-theme={theme}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`} data-theme={theme}>
        <Navbar handleLogout={handleLogout} isSidebarOpen={isSidebarOpen} />
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
