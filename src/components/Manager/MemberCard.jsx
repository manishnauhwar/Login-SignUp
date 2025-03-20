import React, { useContext } from "react";
import { useDrop } from "react-dnd";
import "./MemberCard.css";
import { ThemeContext } from "../../utils/ThemeContext";

const ITEM_TYPE = "ASSIGNED_TASK";

const MemberCard = ({ member, onTaskDrop }) => {
  const { theme } = useContext(ThemeContext);
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ITEM_TYPE,
    drop: (task) => {
      onTaskDrop(task.id, member.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));
  return (
    <div
      ref={drop}
      className="member-card"
      data-theme={theme}
      style={{
        border: isOver ? "2px solid green" : "1px solid #ddd",
        backgroundColor: isOver ? "#f0fff0" : "white",
      }}
    >
      <h3>{member.name}</h3>
      <p><strong>Role:</strong> {member.role}</p>
      <p><strong>Email:</strong> {member.email}</p>
    </div>
  );
};

export default MemberCard;
