import React, { useContext } from "react";
import { useDrop } from "react-dnd";
import "./TeamCard.css";
import { ThemeContext } from "../../utils/ThemeContext";

const ITEM_TYPE = "TASK";

const TeamCard = ({ team, onDropTask }) => {
  const { theme } = useContext(ThemeContext);
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ITEM_TYPE,
    drop: (item) => {
      if (item && item._id) {
        onDropTask(item._id, team._id);
      } else {
        console.error("Invalid item dropped:", item);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));


  return (
    <div
      ref={drop}
      className={`team-group ${theme}`}
      style={{
        border: isOver ? "2px solid green" : "1px solid #ddd",
        backgroundColor: isOver ? "#f0fff0" : "white",
      }}
    >
      <h2 className="team-name">{team.name}</h2>
      <p className="team-manager">
        <strong>Manager:</strong> {team.manager.username} ({team.manager.email})
      </p>
      <table className="team-table">
        <thead>
          <tr className="team-table-header">
            <th className="team-table-cell">Name</th>
            <th className="team-table-cell">Email</th>
            <th className="team-table-cell">Role</th>
          </tr>
        </thead>
        <tbody>
          {team.members.length > 0 ? (
            team.members.map((member) => (
              <tr key={member._id} className="team-table-row">
                <td className="team-table-cell">{member.username}</td>
                <td className="team-table-cell">{member.email}</td>
                <td className="team-table-cell">{member.role}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="team-table-cell">No members found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TeamCard;
