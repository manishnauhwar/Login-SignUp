import React, { useContext } from "react";
import { useDrop } from "react-dnd";
import "./TeamCard.css";
import { ThemeContext } from "../../utils/ThemeContext";
import { useTranslation } from "react-i18next";

const ITEM_TYPE = "TASK";

const TeamCard = ({
  team,
  onDropTask,
  onEditTeam,
  onDeleteTeam,
  onViewMembers,
  isAdmin,
  isManager = false,
  isAssigningTask = false,
  assigningTaskId = null,
  isDeletingTeam = false,
  isLoadingTeams = false
}) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ITEM_TYPE,
    drop: (item) => {
      if (item && item._id && !isAssigningTask) {
        onDropTask(item._id, team._id);
      } else if (isAssigningTask) {
        console.log("Task assignment in progress, cannot drop");
      } else {
        console.error("Invalid item dropped:", item);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
    canDrop: () => !isAssigningTask && !isLoadingTeams,
  }));

  const memberCount = team.members ? team.members.length : 0;
  const isTaskBeingAssigned = isAssigningTask;
  const buttonsDisabled = isTaskBeingAssigned || isLoadingTeams;

  return (
    <div
      ref={drop}
      className={`team-group ${isOver ? 'is-over' : ''} ${isTaskBeingAssigned ? 'task-assigning' : ''}`}
      data-theme={theme}
    >
      {isTaskBeingAssigned && (
        <div className="team-loading-overlay">
          <div className="team-loading-spinner"></div>
          <p className="loading-message">{t('assigningTask') || 'Assigning task...'}</p>
        </div>
      )}
      <div className="team-card-header">
        <h2 className="team-name">{team.name}</h2>
        <div className="team-actions">
          {(isAdmin || isManager) && (
            <>
              <button
                className="team-view-btn"
                onClick={() => onViewMembers(team)}
                title={t("viewMembers")}
                disabled={buttonsDisabled}
              >
                <i className="fas fa-users"></i>
              </button>
              <button
                className="team-edit-btn"
                onClick={() => onEditTeam(team)}
                title={t("editTeam")}
                disabled={buttonsDisabled}
              >
                <i className="fas fa-edit"></i>
              </button>
            </>
          )}
          {isAdmin && (
            <button
              className="team-delete-btn"
              onClick={() => onDeleteTeam(team._id)}
              title={t("delete")}
              disabled={buttonsDisabled}
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          )}
        </div>
      </div>
      <p className="team-manager">
        <strong>{t("manager")}:</strong> {team.manager.fullname}
      </p>
      <table className="team-table">
        <thead>
          <tr className="team-table-header">
            <th className="team-table-cell">{t("name")}</th>
            <th className="team-table-cell">{t("email")}</th>
            <th className="team-table-cell">{t("role")}</th>
          </tr>
        </thead>
        <tbody>
          {team.members.length > 0 ? (
            team.members.map((member) => (
              <tr key={member._id} className="team-table-row">
                <td className="team-table-cell">{member.fullname}</td>
                <td className="team-table-cell">{member.email}</td>
                <td className="team-table-cell">{member.role}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="team-table-cell">{t("noMembersFound")}</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="team-info">
        <p className="team-members-count">
          <i className="fas fa-user"></i> {memberCount} {memberCount === 1 ? t("member") : t("members")}
        </p>
        {team.description && (
          <p className="team-description">{team.description}</p>
        )}
      </div>
    </div>
  );
};

export default TeamCard;
