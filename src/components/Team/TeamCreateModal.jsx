import React, { useState, useEffect, useContext } from "react";
import Modal from "react-modal";
import { ThemeContext } from "../../utils/ThemeContext";
import axiosInstance from "../../utils/axiosInstance";
import "./TeamCreateModal.css";
import { useTranslation } from "react-i18next";

const TeamCreateModal = ({ isOpen, onClose, onTeamCreated }) => {
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

    if (isOpen) {
      fetchUsers();
      setTeamName("");
      setSelectedManager("");
      setSelectedMembers([]);
      setError("");
    }
  }, [isOpen, t]);

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

      const response = await axiosInstance.post("/teams/post", teamData);

      if (response.status === 201) {
        try {
          for (const memberId of selectedMembers) {
            await axiosInstance.patch(`/users/${memberId}`, {
              teamId: response.data._id
            });
          }
        } catch (userUpdateError) {
          console.error("Error updating user documents:", userUpdateError);
        }

        localStorage.setItem('teamCreated', Date.now().toString());

        window.dispatchEvent(new StorageEvent('storage', {
          key: 'teamCreated',
          newValue: Date.now().toString()
        }));

        localStorage.setItem('lastTeamManagerId', selectedManager);

        onTeamCreated(response.data);
        onClose();
      }
    } catch (error) {
      console.error("Error creating team:", error);
      setError(error.response?.data?.message || t("failedToCreateTeam"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={t("createTeam")}
      className="team-modal-content"
      overlayClassName="team-modal-overlay"
      ariaHideApp={false}
      data-theme={theme}
    >
      <div className="team-modal-header">
        <h2>{t("createNewTeam")}</h2>
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
            {isSubmitting ? t("creating") : t("createTeam")}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TeamCreateModal; 