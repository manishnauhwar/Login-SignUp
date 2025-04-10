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
import ToastContainer from "../Toast/ToastContainer";
import { useTranslation } from "react-i18next";

const Teams = () => {
  const navigate = useNavigate();
  const { createNotification } = useNotifications();
  const { theme } = useContext(ThemeContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, teamId: null });
  const [isViewMembersModalOpen, setIsViewMembersModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const { t } = useTranslation();
  const [isAssigningTask, setIsAssigningTask] = useState(false);
  const [assigningTaskId, setAssigningTaskId] = useState(null);
  const [isDeletingTeam, setIsDeletingTeam] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);

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
    const fetchTeams = async () => {
      setIsLoadingTeams(true);
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

          addToast("Failed to fetch teams", "error");
        }
      } finally {
        setIsLoadingTeams(false);
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

          addToast("Failed to fetch tasks", "error");
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

    localStorage.setItem('teamUpdated', Date.now().toString());
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

      addToast(`Team "${updatedTeam.name}" has been updated`, "success");
    }
  };

  const handleDeleteTeam = (teamId) => {
    setConfirmDelete({ show: true, teamId });
  };

  const confirmDeleteTeam = async () => {
    if (!confirmDelete.teamId) return;

    try {
      setIsDeletingTeam(true);
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

        addToast("Team has been deleted", "success");
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

        addToast("Failed to delete team", "error");
      }
    } finally {
      setIsDeletingTeam(false);
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

      addToast(`Team "${newTeam.name}" has been created`, "success");
    }
  };

  const handleAssignTask = async (taskId, teamId) => {
    try {
      setIsAssigningTask(true);
      setAssigningTaskId(taskId);

      const assignedTeam = teams.find((team) => team._id === teamId);
      if (!assignedTeam) {
        console.error('Team not found:', teamId);
        addToast("Team not found", "error");
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
        const messageForManager = userRole === 'admin'
          ? `Admin has assigned you a new task: "${response.data.title}"`
          : `${currentUser.fullname} has assigned you a new task: "${response.data.title}"`;

        await createNotification({
          type: 'task_assigned',
          title: 'New Task Assignment',
          message: messageForManager,
          recipient: managerId,
          sender: userId
        });

        if (assignedTeam.members && assignedTeam.members.length > 0) {

          const messageForMembers = `A new task "${response.data.title}" has been assigned to your team "${assignedTeam.name}"`;

          for (const member of assignedTeam.members) {
            if ((member._id || member.id) !== managerId) {
              const memberId = member._id || member.id;

              try {
                await new Promise(resolve => setTimeout(resolve, 100));

                await createNotification({
                  type: 'task_assigned',
                  title: 'New Team Task',
                  message: messageForMembers,
                  recipient: memberId,
                  sender: userId
                });

              } catch (notifError) {
                console.error(`Failed to send notification to member ${memberId}:`, notifError);
              }
            }
          }
        } else {
          console.log("No team members to notify");
        }

        addToast(`Task "${response.data.title}" assigned to ${assignedTeam.name}`, "success");
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

        addToast("Failed to assign task", "error");
      }
    } finally {
      setIsAssigningTask(false);
      setAssigningTaskId(null);
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
    setSelectedTeam(team);
    setIsViewMembersModalOpen(true);
  };

  return (
    <div className="home-container" data-theme={theme}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`} data-theme={theme}>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
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
              <h2 className="team-section-heading">{t("teams")}</h2>
              {isAdmin && (
                <button
                  className="create-team-btn"
                  onClick={handleOpenCreateModal}
                  disabled={isLoadingTeams}
                >
                  + {t("createTeam")}
                </button>
              )}
            </div>
            <div className="teams-list-wrapper">
              <div className="teams-cards-container">
                {isLoadingTeams ? (
                  <div className="team-loading">
                    <div className="team-loading-spinner"></div>
                    <p>{t("loadingTeams") || "Loading teams..."}</p>
                  </div>
                ) : teams.length > 0 ? (
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
                      isAssigningTask={isAssigningTask}
                      assigningTaskId={assigningTaskId}
                      isDeletingTeam={isDeletingTeam}
                      isLoadingTeams={isLoadingTeams}
                    />
                  ))
                ) : (
                  <p className="no-teams-message">{t("noTeamsAvailable")}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {confirmDelete.show && (
        <div className="confirm-delete-overlay">
          <div className="confirm-delete-modal" data-theme={theme}>
            <h3>{t("confirmDelete")}</h3>
            <p>{t("confirmDeleteTeamMessage")}</p>
            <div className="confirm-delete-actions">
              <button onClick={cancelDeleteTeam} className="cancel-delete-btn">{t("cancel")}</button>
              <button onClick={confirmDeleteTeam} className="confirm-delete-btn">{t("delete")}</button>
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
