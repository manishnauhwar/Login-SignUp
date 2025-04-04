import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../utils/auth";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import Main from "../Title/Main";
import TaskCard from "../Team/TaskCard";
import TeamCard from "../Team/TeamCard";
import TeamCreateModal from "./TeamCreateModal";
import TeamEditModal from "./TeamEditModal";
import "./Teams.css";
import { useNotifications } from "../../utils/NotificationContext";
import { ThemeContext } from "../../utils/ThemeContext";
import axiosInstance from "../../utils/axiosInstance";
import TeamMembersModal from "../Profile/TeamMembersModal";

const Teams = () => {
  const navigate = useNavigate();
  const { createNotification } = useNotifications();
  const { theme } = useContext(ThemeContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, teamId: null });
  const [isViewMembersModalOpen, setIsViewMembersModalOpen] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axiosInstance.get("/teams");
        setTeams(response.data);
      } catch (error) {
        console.error("Error fetching teams:", error);
        if (currentUser) {
          const userId = currentUser._id || currentUser.id;
          createNotification({
            type: 'task_updated',
            title: 'Error',
            message: 'Failed to fetch teams',
            recipient: userId,
            sender: userId
          });
        }
      }
    };

    const fetchTasks = async () => {
      try {
        const response = await axiosInstance.get("/tasks");
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        if (currentUser) {
          const userId = currentUser._id || currentUser.id;
          createNotification({
            type: 'task_updated',
            title: 'Error',
            message: 'Failed to fetch tasks',
            recipient: userId,
            sender: userId
          });
        }
      }
    };

    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      const enhancedUser = {
        ...storedUser,
        _id: storedUser._id || storedUser.id,
        id: storedUser._id || storedUser.id
      };
      setCurrentUser(enhancedUser);
    }

    fetchTeams();
    fetchTasks();
  }, [createNotification]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleEditTeam = (team) => {
    setSelectedTeam(team);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTeam(null);
  };

  const handleTeamUpdated = (updatedTeam) => {
    setTeams(prevTeams =>
      prevTeams.map(team => team._id === updatedTeam._id ? updatedTeam : team)
    );

    // Notify about team update via localStorage
    localStorage.setItem('teamUpdated', Date.now().toString());
    // Trigger event for same-page updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'teamUpdated',
      newValue: Date.now().toString()
    }));

    if (currentUser) {
      const userId = currentUser._id || currentUser.id;
      createNotification({
        type: 'team_updated',
        title: 'Team Updated',
        message: `Team "${updatedTeam.name}" has been successfully updated`,
        recipient: userId,
        sender: userId
      });
    }
  };

  const handleDeleteTeam = (teamId) => {
    setConfirmDelete({ show: true, teamId });
  };

  const confirmDeleteTeam = async () => {
    if (!confirmDelete.teamId) return;

    try {
      await axiosInstance.delete(`/teams/${confirmDelete.teamId}`);

      setTeams(prevTeams => prevTeams.filter(team => team._id !== confirmDelete.teamId));

      localStorage.setItem('teamDeleted', Date.now().toString());
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'teamDeleted',
        newValue: Date.now().toString()
      }));

      if (currentUser) {
        const userId = currentUser._id || currentUser.id;
        createNotification({
          type: 'team_deleted',
          title: 'Team Deleted',
          message: 'Team has been successfully deleted',
          recipient: userId,
          sender: userId
        });
      }
    } catch (error) {
      console.error("Error deleting team:", error);
      if (currentUser) {
        const userId = currentUser._id || currentUser.id;
        createNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete team. Please try again.',
          recipient: userId,
          sender: userId
        });
      }
    } finally {
      setConfirmDelete({ show: false, teamId: null });
    }
  };

  const cancelDeleteTeam = () => {
    setConfirmDelete({ show: false, teamId: null });
  };

  const handleTeamCreated = (newTeam) => {
    setTeams(prevTeams => [...prevTeams, newTeam]);

    localStorage.setItem('teamCreated', Date.now().toString());
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'teamCreated',
      newValue: Date.now().toString()
    }));

    if (currentUser) {
      const userId = currentUser._id || currentUser.id;
      createNotification({
        type: 'team_created',
        title: 'Team Created',
        message: `Team "${newTeam.name}" has been successfully created`,
        recipient: userId,
        sender: userId
      });
    }
  };

  const handleAssignTask = async (taskId, teamId) => {
    try {
      const assignedTeam = teams.find((team) => team._id === teamId);
      if (!assignedTeam) {
        console.error('Team not found:', teamId);
        throw new Error("Team not found");
      }

      const taskResponse = await axiosInstance.get(`/tasks/${taskId}`);
      const currentTask = taskResponse.data;

      const managerId = assignedTeam.manager._id || assignedTeam.manager.id;

      const updatedTask = {
        ...currentTask,
        assignedTo: managerId,
        userId: currentTask.userId,
        status: "In progress"
      };

      const response = await axiosInstance.patch(`/tasks/${taskId}`, updatedTask);

      if (response.data) {
        setTasks((prevTasks) => {
          const updatedTasks = prevTasks.map((task) => {
            if (task._id === taskId) {
              const updatedTask = {
                ...task,
                assignedTo: managerId,
                status: "In progress"
              };
              return updatedTask;
            }
            return task;
          });
          return updatedTasks;
        });

        const userRole = currentUser.role;
        const userId = currentUser._id || currentUser.id;
        const message = userRole === 'admin'
          ? `Admin has assigned you a new task: "${response.data.title}"`
          : `${currentUser.fullname} has assigned you a new task: "${response.data.title}"`;

        await createNotification({
          type: 'task_assigned',
          title: 'New Task Assignment',
          message: message,
          recipient: managerId,
          sender: userId
        });
      }
    } catch (error) {
      console.error("Error assigning task:", error);
      if (currentUser) {
        const userId = currentUser._id || currentUser.id;
        createNotification({
          type: 'task_updated',
          title: 'Error',
          message: 'Failed to assign task. Please try again.',
          recipient: userId,
          sender: userId
        });
      }
    }
  };

  const unassignedTasks = tasks.filter(
    (task) => {
      const user = JSON.parse(localStorage.getItem('user'));
      const currentUserId = user?._id || user?.id;
      return (!task.assignedTo || task.assignedTo === currentUserId) && task.status !== "Completed";
    }
  );

  const isAdmin = currentUser?.role === 'admin';

  const handleViewMembers = (team) => {
    console.log("Selected team for viewing members:", team);
    setSelectedTeam(team);
    setIsViewMembersModalOpen(true);
  };

  return (
    <div className="home-container" data-theme={theme}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`} data-theme={theme}>
        <Navbar handleLogout={handleLogout} isSidebarOpen={isSidebarOpen} />
        <Main />
        <div className="split-screen">
          <div className="unassigned">
            <h2>My Tasks</h2>
            <div className="unassigned-tasks">
              {unassignedTasks.length > 0 ? (
                unassignedTasks.map((task) => <TaskCard key={task._id} task={task} />)
              ) : (
                <p>No tasks available.</p>
              )}
            </div>
          </div>
          <div className="team-section-container">
            <div className="team-section-header">
              <h2 className="team-section-heading">Teams</h2>
              {isAdmin && (
                <button
                  className="create-team-btn"
                  onClick={handleOpenCreateModal}
                >
                  + Create Team
                </button>
              )}
            </div>
            <div className="teams-list-wrapper">
              <div className="teams-cards-container">
                {teams.length > 0 ? (
                  teams.map((team) => (
                    <TeamCard
                      key={team._id}
                      team={team}
                      onDropTask={handleAssignTask}
                      onEditTeam={handleEditTeam}
                      onDeleteTeam={handleDeleteTeam}
                      onViewMembers={handleViewMembers}
                      isAdmin={isAdmin}
                      isManager={currentUser?.role === 'manager'}
                    />
                  ))
                ) : (
                  <p className="no-teams-message">No teams available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {confirmDelete.show && (
        <div className="confirm-delete-overlay">
          <div className="confirm-delete-modal" data-theme={theme}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this team? This action cannot be undone.</p>
            <div className="confirm-delete-actions">
              <button onClick={cancelDeleteTeam} className="cancel-delete-btn">Cancel</button>
              <button onClick={confirmDeleteTeam} className="confirm-delete-btn">Delete</button>
            </div>
          </div>
        </div>
      )}

      <TeamCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onTeamCreated={handleTeamCreated}
      />

      {selectedTeam && (
        <TeamEditModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onTeamUpdated={handleTeamUpdated}
          team={selectedTeam}
        />
      )}

      <TeamMembersModal
        isOpen={isViewMembersModalOpen}
        onClose={() => setIsViewMembersModalOpen(false)}
        team={selectedTeam}
        onTeamUpdated={handleTeamUpdated}
      />
    </div>
  );
};

export default Teams;
