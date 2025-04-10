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
import ToastContainer from "../Toast/ToastContainer";
import { useTranslation } from "react-i18next";

const KanbanBoard = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
  const [toasts, setToasts] = useState([]);

  // Loading states
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isMovingTask, setIsMovingTask] = useState(false);
  const [movingTaskId, setMovingTaskId] = useState(null);

  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

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
      setIsMovingTask(true);
      setMovingTaskId(taskId);

      const task = tasks.find(task => task._id === taskId);
      if (!task) {
        console.error("Task not found");
        return;
      }

      if (userRole === "admin" || userRole === "manager") {
        await axiosInstance.patch(`/tasks/${taskId}`, { status: newStatus });
        fetchTasks();
        addToast(`Task "${task.title}" moved to ${newStatus}`, "success");
      } else if (task.assignedTo === userId || task.userId === userId) {
        await axiosInstance.patch(`/tasks/${taskId}`, { status: newStatus });
        fetchTasks();
        addToast(`Task "${task.title}" moved to ${newStatus}`, "success");
      } else {
        console.error("User is not authorized to modify this task");
        addToast("You're not authorized to modify this task", "error");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      addToast("Error updating task status", "error");
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setIsMovingTask(false);
      setMovingTaskId(null);
    }
  };

  const addTask = async () => {
    if (!newTaskData.title.trim() || !newTaskData.dueDate) {
      addToast("Please fill in the required fields", "error");
      return;
    }

    try {
      setIsAddingTask(true);
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
        addToast(`Task "${taskData.title}" created successfully`, "success");
      }
    } catch (error) {
      console.error("Error adding task:", error);
      addToast(error.response?.data?.message || "Failed to add task", "error");
    } finally {
      setIsAddingTask(false);
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
            <TaskCards
              key={task._id}
              task={task}
              isMoving={isMovingTask && movingTaskId === task._id}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="home-container" data-theme={theme}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`} data-theme={theme}>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <Navbar
          handleLogout={handleLogout}
          isSidebarOpen={isSidebarOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <Main />
        <div className="kanban-content">
          <div className="view-toggle">
            <button
              onClick={() => setView("kanban")}
              className={view === "kanban" ? "active" : ""}
              disabled={view === "kanban"}
            >
              {t('kanbanView')}
            </button>
            <button
              onClick={() => setView("calendar")}
              className={view === "calendar" ? "active" : ""}
              disabled={view === "calendar"}
            >
              {t('calendarView')}
            </button>
            <button
              className="add-task-btn"
              onClick={() => setShowModal(true)}
            >
              + {t('addTask')}
            </button>
          </div>
          {view === "kanban" && (
            <>
              <div className="boardContainer">
                <Column title={t('toDo')} statusFilter="To Do" />
                <Column title={t('inProgress')} statusFilter="In progress" />
                <Column title={t('done')} statusFilter="Completed" />
              </div>
            </>
          )}
        </div>
        {view === "calendar" && (
          <CalendarView tasks={tasks} setFilterDate={setFilterDate} filterDate={filterDate} onClose={() => setView("kanban")} />
        )}
        {showModal && (
          <div className="modal">
            <input
              type="text"
              placeholder={t('title')}
              value={newTaskData.title}
              onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
            />
            <textarea
              placeholder={t('taskDescription')}
              value={newTaskData.description}
              onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
            ></textarea>
            <input
              type="date"
              value={newTaskData.dueDate}
              onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })}
            />
            <select
              value={newTaskData.priority}
              onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}
            >
              <option value="Low">{t('priorities.Low')}</option>
              <option value="Medium">{t('priorities.Medium')}</option>
              <option value="High">{t('priorities.High')}</option>
            </select>
            <button
              onClick={addTask}
              disabled={isAddingTask || !newTaskData.title.trim() || !newTaskData.dueDate}
              className={isAddingTask ? "loading" : ""}
            >
              {isAddingTask ? t('adding') || "Adding..." : t('addTask')}
            </button>
            <button
              onClick={() => setShowModal(false)}
              disabled={isAddingTask}
            >
              {t('cancel', 'Cancel')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;
