import React, { useState, useEffect, useContext } from "react";
import Modal from "react-modal";
import { ThemeContext } from "../../utils/ThemeContext";
import axiosInstance from "../../utils/axiosInstance";
import "./TeamMembersModal.css";

Modal.setAppElement('#root');

const TeamMembersModal = ({ isOpen, onClose, team, onTeamUpdated }) => {
  const { theme } = useContext(ThemeContext);
  const [members, setMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    if (isOpen && team) {
      console.log("TeamMembersModal opened with team:", team);
      fetchData();
    } else {
      setMembers([]);
      setAvailableUsers([]);
      setSelectedUsers([]);
      setError('');
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
        setError(`Failed to load team data: ${error.response.data.message || error.message}`);
      } else {
        setError('Failed to load team data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return;

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
      setError("Failed to add members to the team. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
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
      setError("Failed to remove member from the team. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Team Members Modal"
      className={`team-members-modal-content ${theme}`}
      overlayClassName="team-members-modal-overlay"
    >
      <div className="team-members-modal-header">
        <h2>{team ? `${team.name} - Team Members` : 'Team Members'}</h2>
        <button className="team-members-modal-close" onClick={onClose}>&times;</button>
      </div>

      <div className="team-members-modal-body">
        {error && <div className="team-members-modal-error">{error}</div>}

        {isLoading ? (
          <div className="team-members-modal-loading">Loading team data...</div>
        ) : (
          <>
            <div className="team-members-section">
              <h3>Current Members <span>({members.length})</span></h3>
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
                        disabled={isSubmitting}
                        title="Remove from team"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-members-message">This team has no members.</div>
              )}
            </div>

            <div className="team-members-section">
              <h3>Available Users <span>({availableUsers.length})</span></h3>
              {availableUsers.length > 0 ? (
                <>
                  <div className="team-available-users-list">
                    {availableUsers.map(user => (
                      <div
                        key={user._id}
                        className={`team-available-user-item ${selectedUsers.includes(user._id) ? 'team-selected' : ''}`}
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
                      Add Selected ({selectedUsers.length})
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-available-users">No available users found.</div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="team-members-modal-footer">
        <button className="team-members-modal-close-btn" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
};

export default TeamMembersModal; 