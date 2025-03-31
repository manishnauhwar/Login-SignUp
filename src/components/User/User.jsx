import React, { useState, useEffect, useContext } from "react";
import { logout } from "../../utils/auth";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import Main from "../Title/Main";
import "./User.css";
import { ThemeContext } from "../../utils/ThemeContext";
import axiosInstance from "../../utils/axiosInstance";

const User = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState([]);
  const { theme } = useContext(ThemeContext);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData) {
          navigate("/login");
          return;
        }

        const tasksResponse = await axiosInstance.get("/tasks");
        const tasksData = tasksResponse.data;

        if (tasksData && Array.isArray(tasksData)) {
          const userTasks = tasksData.filter(task => task.assignedTo === userData.id);
          setTasks(userTasks);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="home-container" data-theme={theme}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`} data-theme={theme}>
        <Navbar handleLogout={handleLogout} isSidebarOpen={isSidebarOpen} />
        <Main />
        <div className="cards-container">
          <div className="tasks-card">
            <h2>My Tasks</h2>
            {tasks.length > 0 ? (
              <ul className="tasks-list">
                {tasks.map(task => (
                  <li key={task._id} className="task-item">
                    <div className="task-header">
                      <h3>{task.title}</h3>
                      <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="task-description">{task.description}</p>
                    <div className="task-footer">
                      <span className="due-date">Due: {formatDate(task.dueDate)}</span>
                      <span className={`status-badge ${task.status.toLowerCase()}`}>
                        {task.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-tasks">No tasks assigned to you.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;
