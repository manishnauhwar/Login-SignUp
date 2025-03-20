import React, { useState, useEffect, useContext } from "react";
import { logout } from "../../utils/auth";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import Main from "../Title/Main";
import ManagerTaskCard from "./ManagerTaskCard";
import MemberCard from "./MemberCard";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useNotifications } from "../../utils/NotificationContext";
import { ThemeContext } from "../../utils/ThemeContext";
import "./Manager.css";

const Manager = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { theme } = useContext(ThemeContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [manager, setManager] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [managerTasks, setManagerTasks] = useState([]);
  const [teamId, setTeamId] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch("http://localhost:5000/teams");
        const data = await res.json();
        if (Array.isArray(data)) {
          const loggedInManagerId = "M2";
          const managerTeam = data.find((team) => team.manager.id === loggedInManagerId);
          if (managerTeam) {
            setManager(managerTeam.manager);
            setTeamMembers(managerTeam.members);
            setTeamId(managerTeam.id);
          }
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!manager) return;
      try {
        const res = await fetch("http://localhost:5000/tasks");
        const data = await res.json();
        if (Array.isArray(data)) {
          const tasksAssignedToManager = data.filter((task) => task.assignedTo === manager.id);
          setManagerTasks(tasksAssignedToManager);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, [manager]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleTaskDrop = async (taskId, memberId) => {
    try {
      const res = await fetch(`http://localhost:5000/tasks/${taskId}`);
      const taskData = await res.json();
      const assignedMember = teamMembers.find((member) => member.id === memberId);
      if (!assignedMember) return;
      await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: memberId, status: "In progress" }),
      });
      setManagerTasks((prevTasks) =>
        prevTasks.filter((task) => task.id !== taskId)
      );
      addNotification(`Task "${taskData.title}" assigned to ${assignedMember.name}`);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="home-container" data-theme={theme}>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`} data-theme={theme}>
          <Navbar handleLogout={handleLogout} isSidebarOpen={isSidebarOpen} />
          <Main />
          {manager ? (
            <div className="manager-card">
              <h2>Manager Details</h2>
              <p><strong>ID:</strong> {manager.id}</p>
              <p><strong>Name:</strong> {manager.name}</p>
              <p><strong>Email:</strong> {manager.email}</p>
            </div>
          ) : (
            <p>Loading manager details...</p>
          )}
          <div className="wrapped-section">
            <h2>Tasks To Be Assigned</h2>
            {managerTasks.length > 0 ? (
              <div className="task-container">
                {managerTasks.map((task) => (
                  <ManagerTaskCard key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <p>No tasks assigned to you yet.</p>
            )}
          </div>
          <div className="wrapped-section">
            <h2>Team Members</h2>
            {teamMembers.length > 0 ? (
              <div className="team-container">
                {teamMembers.map((member) => (
                  <MemberCard key={member.id} member={member} onTaskDrop={handleTaskDrop} />
                ))}
              </div>
            ) : (
              <p>No team members found.</p>
            )}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default Manager;
