import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../utils/auth";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import Main from "../Title/Main";
import TaskFormModal from "./TaskFormModal";
import TaskCard from "./TaskCard";
import TeamCard from "./TeamCard";
import "./Teams.css";
import { useNotifications } from "../../utils/NotificationContext";
import { ThemeContext } from "../../utils/ThemeContext";

const Teams = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { theme } = useContext(ThemeContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      const res = await fetch("http://localhost:5000/teams");
      const data = await res.json();
      setTeams(data);
    };
    const fetchTasks = async () => {
      const res = await fetch("http://localhost:5000/tasks");
      const data = await res.json();
      setTasks(data);
    };
    fetchTeams();
    fetchTasks();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleAssignTask = async (taskId, teamId) => {
    try {
      const updatedTask = { assignedTo: teamId, status: "In progress" };
      const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });
      if (!response.ok) {
        throw new Error("Failed to assign task");
      }
      const taskData = await response.json();
      const assignedTeam = teams.find((team) => team.id === teamId);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, ...updatedTask } : task
        )
      );
      addNotification(`Task "${taskData.title}" assigned to ${assignedTeam.name}`);
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
              unassignedTasks.map((task) => <TaskCard key={task.id} task={task} />)
            ) : (
              <p>No unassigned tasks available.</p>
            )}
          </div>
        </div>
        <div className="team-section">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} onDropTask={handleAssignTask} />
          ))}
        </div>
        {isModalOpen && <TaskFormModal onClose={() => setIsModalOpen(false)} />}
      </div>
    </div>
  );
};

export default Teams;
