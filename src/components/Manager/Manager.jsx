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
  const { createNotification } = useNotifications();
  const { theme } = useContext(ThemeContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [manager, setManager] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [managerTasks, setManagerTasks] = useState([]);
  const [teamId, setTeamId] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const refreshTeamData = () => {
    setLastRefresh(Date.now());
    if (manager) {
      const managerId = manager._id || manager.id;
      createNotification({
        type: 'info',
        title: 'Refreshing',
        message: 'Refreshing team data...',
        recipient: managerId,
        sender: managerId
      });
    }
  };

  useEffect(() => {
    if (manager) {
      const managerId = manager._id || manager.id;
      localStorage.setItem('currentManagerId', managerId);
    }
  }, [manager]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      const storedUser = JSON.parse(localStorage.getItem('user')) || {};
      const currentManagerId = storedUser._id || storedUser.id;
      const lastTeamManagerId = localStorage.getItem('lastTeamManagerId');
      const previousManagerId = localStorage.getItem('previousTeamManagerId');

      if (e.key === 'teamUpdated' || e.key === 'teamCreated' || e.key === 'teamDeleted' ||
        (lastTeamManagerId && lastTeamManagerId === currentManagerId) ||
        (previousManagerId && previousManagerId === currentManagerId)) {
        refreshTeamData();
        if (lastTeamManagerId === currentManagerId) {
          localStorage.removeItem('lastTeamManagerId');
        }
        if (previousManagerId === currentManagerId) {
          localStorage.removeItem('previousTeamManagerId');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const checkForUpdates = () => {
      const storedUser = JSON.parse(localStorage.getItem('user')) || {};
      const currentManagerId = storedUser._id || storedUser.id;
      const lastTeamManagerId = localStorage.getItem('lastTeamManagerId');
      const previousManagerId = localStorage.getItem('previousTeamManagerId');

      if ((lastTeamManagerId && lastTeamManagerId === currentManagerId) ||
        (previousManagerId && previousManagerId === currentManagerId)) {
        refreshTeamData();

        if (lastTeamManagerId === currentManagerId) {
          localStorage.removeItem('lastTeamManagerId');
        }
        if (previousManagerId === currentManagerId) {
          localStorage.removeItem('previousTeamManagerId');
        }
      }
    };

    checkForUpdates();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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
          const timestamp = new Date().getTime();
          const res = await axiosInstance.get(`/teams?_=${timestamp}`);
          const teamsData = res.data;

          const managerId = storedUser._id || storedUser.id;

          const userTeams = teamsData.filter(team =>
            team.manager._id === managerId || team.manager.id === managerId
          );

          if (userTeams.length > 0) {
            setManager(storedUser);

            const allMembers = [];
            const memberIdsSet = new Set();

            userTeams.forEach(team => {
              if (team.members && Array.isArray(team.members)) {
                team.members.forEach(member => {
                  const memberId = typeof member === 'object' ? member._id : member;

                  if (!memberIdsSet.has(memberId)) {
                    memberIdsSet.add(memberId);
                    if (typeof member === 'object') {
                      allMembers.push(member);
                    }
                  }
                });
              }
            });

            if (allMembers.length > 0) {
              setTeamMembers(allMembers);
              console.log("Found", allMembers.length, "team members from", userTeams.length, "teams");
            }
            else if (memberIdsSet.size > 0) {
              try {
                const usersResponse = await axiosInstance.get("/users/alluser");
                const allUsers = usersResponse.data.allUsers || [];

                const memberObjects = Array.from(memberIdsSet)
                  .map(memberId => {
                    const memberObj = allUsers.find(user =>
                      user._id === memberId || user.id === memberId
                    );
                    return memberObj || null;
                  })
                  .filter(member => member !== null);

                setTeamMembers(memberObjects);
                console.log("Fetched", memberObjects.length, "team members from IDs");
              } catch (userError) {
                console.error("Error fetching users:", userError);
                setTeamMembers([]);
              }
            } else {
              setTeamMembers([]);
            }

            setTeamId(userTeams[0]._id);

            console.log("Manager is assigned to", userTeams.length, "teams");
          } else {
            console.log("No team found for manager:", managerId);
            setManager(storedUser);
            setTeamMembers([]);
            setTeamId(null);
          }
        } catch (error) {
          console.error("Error fetching teams:", error);
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
  }, [lastRefresh]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!manager) return;
      try {
        const res = await axiosInstance.get("/tasks");
        const data = res.data;

        if (Array.isArray(data)) {
          const managerId = manager._id || manager.id;
          const tasksAssignedToManager = data.filter((task) => {
            return task.assignedTo === managerId;
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

      const memberMessage = `Manager ${manager.fullname} has assigned you a new task: "${taskData.title}"`;

      await createNotification({
        type: 'task_assigned',
        title: 'New Task Assignment',
        message: memberMessage,
        recipient: memberId,
        sender: manager._id || manager.id
      });

      try {
        const adminId = taskData.userId;

        if (adminId && adminId !== (manager._id || manager.id)) {
          const adminMessage = `Manager ${manager.fullname} has assigned task "${taskData.title}" to ${assignedMember.fullname}`;

          await createNotification({
            type: 'task_updated',
            title: 'Task Assigned by Manager',
            message: adminMessage,
            recipient: adminId,
            sender: manager._id || manager.id
          });
        }
      } catch (adminError) {
        console.error("Error sending notification to admin:", adminError);
      }
    } catch (error) {
      console.error("Error updating task:", error);
      createNotification({
        type: 'task_updated',
        title: 'Error',
        message: 'Failed to assign task to team member',
        recipient: manager._id || manager.id,
        sender: manager._id || manager.id
      });
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="home-container" data-theme={theme}>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`} data-theme={theme}>
          <Navbar handleLogout={handleLogout} isSidebarOpen={isSidebarOpen} />
          <Main />
          <div className="sections-container">
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
              <div className="team-section-header">
                <h2>My Team Members</h2>
                <button
                  className="refresh-team-btn"
                  onClick={refreshTeamData}
                  title="Refresh Team Data"
                >
                  <i className="fas fa-sync-alt"></i> Refresh
                </button>
              </div>
              <p className="team-members-note">
                Showing team members from all teams you manage.
                <span className="member-count-badge">{teamMembers.length} members</span>
              </p>
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
      </div>
    </DndProvider>
  );
};

export default Manager;
