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
import axiosInstance from "../../utils/axiosInstance";

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
        const storedUser = JSON.parse(localStorage.getItem('user'));

        if (!storedUser) {
                    return;
        }

        if (storedUser.role !== 'manager') {
          setManager(storedUser);
          setTeamMembers([]);
          setTeamId(null);
          return;
        }

        try {
          const res = await axiosInstance("/teams");
          const teamsData = res.data;

          const userTeam = teamsData.find(team => team.manager._id === storedUser.id);

          if (userTeam) {
            setManager(userTeam.manager);
            setTeamMembers(userTeam.members);
            setTeamId(userTeam._id);
          } else {
            setManager(storedUser);
            setTeamMembers([]);
            setTeamId(null);
          }
        } catch (error) {
          if (error.response?.status === 403) {
            setManager(storedUser);
            setTeamMembers([]);
            setTeamId(null);
          } else {
            throw error; 
          }
        }
      } catch (error) {
        console.error("Error in fetchTeams:", error);
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          setManager(storedUser);
          setTeamMembers([]);
          setTeamId(null);
        }
      }
    };
    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!manager) return;
      try {
        const res = await axiosInstance.get("/tasks");
        const data = res.data;

        if (Array.isArray(data)) {
          const tasksAssignedToManager = data.filter((task) => {
            return task.assignedTo === manager._id;
          });
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
      const taskRes = await axiosInstance.get(`/tasks/${taskId}`);
      const taskData = taskRes.data;

      const assignedMember = teamMembers.find((member) => member._id === memberId);
      if (!assignedMember) {
        return;
      }
      await axiosInstance.patch(`/tasks/${taskId}`, {
        assignedTo: memberId,
        status: "In progress"
      });

      setManagerTasks((prevTasks) =>
        prevTasks.filter((task) => task._id !== taskId)
      );

      addNotification(`Task "${taskData.title}" assigned to ${assignedMember.username}`);
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
              <p><strong>ID:</strong> {manager._id}</p>
              <p><strong>Name:</strong> {manager.username}</p>
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
                  <ManagerTaskCard key={task._id} task={task} />
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
                  <MemberCard key={member._id} member={member} onTaskDrop={handleTaskDrop} />
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
