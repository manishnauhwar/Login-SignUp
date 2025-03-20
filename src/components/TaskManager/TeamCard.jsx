import React, { useContext } from "react";
import { useDrop } from "react-dnd";
import "./TeamCard.css";
import { ThemeContext } from "../../utils/ThemeContext";

const ITEM_TYPE = "TASK";

const TeamCard = ({ team, onDropTask }) => {
  const { theme } = useContext(ThemeContext);
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ITEM_TYPE,
    drop: (item) => onDropTask(item.id, team.id),
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
        <strong>Manager:</strong> {team.manager.name} ({team.manager.email})
      </p>
      <table className="team-table">
        <thead>
          <tr className="team-table-header">
            <th className="team-table-cell">ID</th>
            <th className="team-table-cell">Name</th>
            <th className="team-table-cell">Email</th>
            <th className="team-table-cell">Role</th>
          </tr>
        </thead>
        <tbody>
          {team.members.map((member) => (
            <tr key={member.id} className="team-table-row">
              <td className="team-table-cell">{member.id}</td>
              <td className="team-table-cell">{member.name}</td>
              <td className="team-table-cell">{member.email}</td>
              <td className="team-table-cell">{member.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeamCard;
