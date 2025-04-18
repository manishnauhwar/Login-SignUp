import React, { useState, useEffect, useContext } from "react";
import Modal from "react-modal";
import { ThemeContext } from "../../utils/ThemeContext";
import axiosInstance from "../../utils/axiosInstance";
import "./TeamCreateModal.css";
import { useTranslation } from "react-i18next";

const TeamEditModal = ({ isOpen, onClose, onTeamUpdated, team }) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [teamName, setTeamName] = useState("");
  const [selectedManager, setSelectedManager] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/users/alluser");
        const allUsers = response.data.allUsers || [];

        const managersList = allUsers.filter(user => user.role === "manager");
        const regularUsers = allUsers.filter(user => user.role === "user");

        setManagers(managersList);
        setUsers(regularUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError(t("failedToLoadUsers"));
      }
    };

    if (isOpen && team) {
      fetchUsers();
      setTeamName(team.name || "");
      setSelectedManager(team.manager._id || "");

      if (team.members && Array.isArray(team.members)) {
        setSelectedMembers(team.members.map(member => member._id));
      } else {
        setSelectedMembers([]);
      }

      setError("");
    }
  }, [isOpen, team, t]);

  const handleMemberSelection = (userId) => {
    setSelectedMembers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAllMembers = () => {
    if (selectedMembers.length === users.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(users.map(user => user._id));
    }
  };

  const validateForm = () => {
    if (!teamName.trim()) {
      setError(t("teamNameIsRequired"));
      return false;
    }
    if (!selectedManager) {
      setError(t("pleaseSelectManager"));
      return false;
    }
    if (selectedMembers.length === 0) {
      setError(t("pleaseSelectMember"));
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const teamData = {
        name: teamName,
        managerId: selectedManager,
        memberIds: selectedMembers
      };

      const response = await axiosInstance.put(`/teams/${team._id}`, teamData);

      if (response.status === 200) {
        try {
          const previousManagerId = team.manager._id;
          const previousMemberIds = team.members.map(member => member._id);

          for (const memberId of selectedMembers) {
            await axiosInstance.patch(`/users/${memberId}`, {
              teamId: team._id
            });
          }

          for (const prevMemberId of previousMemberIds) {
            if (!selectedMembers.includes(prevMemberId) && prevMemberId !== selectedManager) {
              await axiosInstance.patch(`/users/${prevMemberId}`, {
                teamId: null
              });
            }
          }
        } catch (userUpdateError) {
          console.error("Error updating user documents:", userUpdateError);
        }

        if (team.manager._id !== selectedManager) {
          localStorage.setItem('previousTeamManagerId', team.manager._id);
        }

        localStorage.setItem('teamUpdated', Date.now().toString());

        window.dispatchEvent(new StorageEvent('storage', {
          key: 'teamUpdated',
          newValue: Date.now().toString()
        }));

        localStorage.setItem('lastTeamManagerId', selectedManager);

        const updatedTeamResponse = await axiosInstance.get(`/teams/${team._id}`);
        if (updatedTeamResponse.status === 200) {
          onTeamUpdated(updatedTeamResponse.data);
          onClose();
        }
      }
    } catch (error) {
      console.error("Error updating team:", error);
      setError(error.response?.data?.message || t("failedToCreateTeam"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!team) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={t("editTeam")}
      className="team-modal-content"
      overlayClassName="team-modal-overlay"
      ariaHideApp={false}
      data-theme={theme}
    >
      <div className="team-modal-header">
        <h2>{t("editTeam")}</h2>
        <button className="team-modal-close" onClick={onClose}>×</button>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="team-modal-error">{error}</div>}

        <div className="team-modal-field">
          <label htmlFor="teamName">{t("teamName")}</label>
          <input
            id="teamName"
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder={t("enterTeamName")}
          />
        </div>

        <div className="team-modal-field">
          <label htmlFor="manager">{t("selectManager")}</label>
          <select
            id="manager"
            value={selectedManager}
            onChange={(e) => setSelectedManager(e.target.value)}
          >
            <option value="">{t("selectAManager")}</option>
            {managers.map(manager => (
              <option key={manager._id} value={manager._id}>
                {manager.fullname}
              </option>
            ))}
          </select>
        </div>

        <div className="team-modal-field">
          <div className="team-members-header">
            <label>{t("selectTeamMembers")} ({selectedMembers.length}/{users.length})</label>
            <button
              type="button"
              className="select-all-btn"
              onClick={handleSelectAllMembers}
            >
              {selectedMembers.length === users.length ? t("deselectAll") : t("selectAll")}
            </button>
          </div>
          <div className="team-members-list">
            {users.length > 0 ? (
              users.map(user => (
                <div key={user._id} className="team-member-item">
                  <input
                    type="checkbox"
                    id={`member-${user._id}`}
                    className="team-member-checkbox"
                    checked={selectedMembers.includes(user._id)}
                    onChange={() => handleMemberSelection(user._id)}
                  />
                  <label htmlFor={`member-${user._id}`}>{user.fullname}</label>
                </div>
              ))
            ) : (
              <p>{t("noUsersAvailable")}</p>
            )}
          </div>
        </div>

        <div className="team-modal-actions">
          <button
            type="button"
            onClick={onClose}
            className="team-modal-cancel"
            disabled={isSubmitting}
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            className="team-modal-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? t("updating") : t("updateTeam")}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TeamEditModal; 