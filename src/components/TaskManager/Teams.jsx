import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../utils/auth";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import Main from "../Title/Main";
import TaskCard from "./TaskCard";
import TeamCard from "./TeamCard";
import "./Teams.css";
import { useNotifications } from "../../utils/NotificationContext";
import { ThemeContext } from "../../utils/ThemeContext";
import axiosInstance from "../../utils/axiosInstance";

const Teams = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { theme } = useContext(ThemeContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axiosInstance.get("/teams");
        setTeams(response.data);
      } catch (error) {
        console.error("Error fetching teams:", error);
        addNotification("Failed to fetch teams");
      }
    };

    const fetchTasks = async () => {
      try {
        const response = await axiosInstance.get("/tasks");
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        addNotification("Failed to fetch tasks");
      }
    };

    fetchTeams();
    fetchTasks();
  }, [addNotification]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleAssignTask = async (taskId, teamId) => {
    try {
      const assignedTeam = teams.find((team) => team._id === teamId);
      if (!assignedTeam) {
        throw new Error("Team not found");
      }

      const taskResponse = await axiosInstance.get(`/tasks/${taskId}`);
      const currentTask = taskResponse.data;

      const updatedTask = {
        ...currentTask,
        assignedTo: assignedTeam.manager._id,
        userId: currentTask.userId,
        status: "In progress"
      };

      const response = await axiosInstance.patch(`/tasks/${taskId}`, updatedTask);

      if (response.data) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId ? { ...task, ...updatedTask } : task
          )
        );
        addNotification(`Task "${response.data.title}" assigned to ${assignedTeam.manager.username}`);
      }
    } catch (error) {
      console.error("Error assigning task:", error);
      addNotification("Failed to assign task. Please try again.");
    }
  };

  const unassignedTasks = tasks.filter(
    (task) => !task.assignedTo && task.status !== "Completed"
  );

  return (
    <div className="home-container" data-theme={theme}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`} data-theme={theme}>
        <Navbar handleLogout={handleLogout} isSidebarOpen={isSidebarOpen} />
        <Main />
        <div className="unassigned">
          <h2>Unassigned Tasks</h2>
          <div className="unassigned-tasks">
            {unassignedTasks.length > 0 ? (
              unassignedTasks.map((task) => <TaskCard key={task._id} task={task} />)
            ) : (
              <p>No unassigned tasks available.</p>
            )}
          </div>
        </div>
        <div className="team-section">
          {teams.map((team) => (
            <TeamCard key={team._id} team={team} onDropTask={handleAssignTask} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Teams;
