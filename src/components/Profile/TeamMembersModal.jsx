import React, { useState, useEffect, useContext } from "react";
import Modal from "react-modal";
import { ThemeContext } from "../../utils/ThemeContext";
import axiosInstance from "../../utils/axiosInstance";
import "./TeamMembersModal.css";
import { useTranslation } from "react-i18next";

Modal.setAppElement('#root');

const TeamMembersModal = ({ isOpen, onClose, team, onTeamUpdated }) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [members, setMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [removingMemberId, setRemovingMemberId] = useState(null);

  useEffect(() => {
    if (isOpen && team) {
      fetchData();
    } else {
      setMembers([]);
      setAvailableUsers([]);
      setSelectedUsers([]);
      setError('');
      setRemovingMemberId(null);
    }
  }, [isOpen, team]);

  const fetchData = async () => {
    if (!team) return;

    setIsLoading(true);
    setError('');

    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const teamResponse = await axiosInstance.get(`/teams/${team._id}`);
      const usersResponse = await axiosInstance.get('/users/role/user');

      if (teamResponse.data && usersResponse.data) {
        const teamData = teamResponse.data;
        const teamMembers = teamData.members || [];
        setMembers(teamMembers);
        const teamMemberIds = teamMembers.map(member => member._id);
        const availableUsersData = usersResponse.data.filter(
          user => !teamMemberIds.includes(user._id)
        );

        setAvailableUsers(availableUsersData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        setError(`${t("failedToLoadTeamData")}: ${error.response.data.message || error.message}`);
      } else {
        setError(t("failedToLoadTeamData"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = (userId) => {
    if (isSubmitting) return;

    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      const updatedMembers = [...members.map(member => member._id), ...selectedUsers];

      const teamResponse = await axiosInstance.put(`/teams/${team._id}`, {
        memberIds: updatedMembers
      });

      for (const userId of selectedUsers) {
        await axiosInstance.patch(`/users/${userId}`, {
          teamId: team._id
        });
      }

      setMembers(prevMembers => [
        ...prevMembers,
        ...availableUsers.filter(user => selectedUsers.includes(user._id))
      ]);
      setAvailableUsers(prevUsers =>
        prevUsers.filter(user => !selectedUsers.includes(user._id))
      );
      setSelectedUsers([]);

      if (onTeamUpdated) {
        onTeamUpdated(teamResponse.data);
      }
    } catch (error) {
      console.error("Error adding team members:", error);
      setError(t("failedToAddMembers"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (isSubmitting || removingMemberId) return;

    setRemovingMemberId(memberId);
    setIsSubmitting(true);
    setError('');

    try {
      const updatedMembers = members.filter(member => member._id !== memberId).map(member => member._id);

      const teamResponse = await axiosInstance.put(`/teams/${team._id}`, {
        memberIds: updatedMembers
      });
      await axiosInstance.patch(`/users/${memberId}`, {
        teamId: null
      });
      const removedMember = members.find(member => member._id === memberId);

      setMembers(prevMembers =>
        prevMembers.filter(member => member._id !== memberId)
      );

      if (removedMember) {
        setAvailableUsers(prevUsers => [...prevUsers, removedMember]);
      }
      if (onTeamUpdated) {
        onTeamUpdated(teamResponse.data);
      }
    } catch (error) {
      console.error("Error removing team member:", error);
      setError(t("failedToRemoveMember"));
    } finally {
      setIsSubmitting(false);
      setRemovingMemberId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={!isSubmitting ? onClose : undefined}
      contentLabel={t("teamMembers")}
      className={`team-members-modal-content ${theme}`}
      overlayClassName="team-members-modal-overlay"
    >
      <div className="team-members-modal-header">
        <h2>{team ? `${team.name} - ${t("teamMembers")}` : t("teamMembers")}</h2>
        <button
          className="team-members-modal-close"
          onClick={onClose}
          disabled={isSubmitting}
        >
          &times;
        </button>
      </div>

      <div className="team-members-modal-body">
        {error && <div className="team-members-modal-error">{error}</div>}

        {isLoading ? (
          <div className="team-members-modal-loading">
            <div className="team-members-spinner"></div>
            <p>{t("loadingTeamData")}</p>
          </div>
        ) : (
          <>
            <div className="team-members-section">
              <h3>{t("currentMembers")} <span>({members.length})</span></h3>
              {members.length > 0 ? (
                <div className="team-members-list">
                  {members.map(member => (
                    <div key={member._id} className="team-member-item">
                      <div className="team-member-info">
                        <span className="team-member-name">{member.fullname}</span>
                        <span className="team-member-email">{member.email}</span>
                      </div>
                      <button
                        className="team-member-remove-btn"
                        onClick={() => handleRemoveMember(member._id)}
                        disabled={isSubmitting || removingMemberId !== null}
                        title={t("delete")}
                      >
                        {removingMemberId === member._id ? (
                          <div className="button-spinner-small"></div>
                        ) : (
                          <i className="fas fa-times"></i>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-members-message">{t("noMembersMessage")}</div>
              )}
            </div>

            <div className="team-members-section">
              <h3>{t("availableUsers")} <span>({availableUsers.length})</span></h3>
              {availableUsers.length > 0 ? (
                <>
                  <div className="team-available-users-list">
                    {availableUsers.map(user => (
                      <div
                        key={user._id}
                        className={`team-available-user-item ${selectedUsers.includes(user._id) ? 'team-selected' : ''} ${isSubmitting ? 'team-disabled' : ''}`}
                        onClick={() => handleUserSelect(user._id)}
                      >
                        <div className="team-modal-user-info">
                          <span className="team-modal-user-name">{user.fullname}</span>
                          <span className="team-modal-user-email">{user.email}</span>
                        </div>
                        {selectedUsers.includes(user._id) && (
                          <div className="team-modal-select-indicator">
                            <i className="fas fa-check"></i>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="add-members-actions">
                    <button
                      className="add-members-btn"
                      onClick={handleAddMembers}
                      disabled={isSubmitting || selectedUsers.length === 0}
                    >
                      {isSubmitting ? (
                        <><span className="button-spinner"></span> {t("adding")}</>
                      ) : (
                        <>{t("addSelected")} ({selectedUsers.length})</>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-available-users">{t("noAvailableUsers")}</div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="team-members-modal-footer">
        <button
          className="team-members-modal-close-btn"
          onClick={onClose}
          disabled={isSubmitting}
        >
          {t("close")}
        </button>
      </div>
    </Modal>
  );
};

export default TeamMembersModal; 