import React, { useContext } from "react";
import { useDrag } from "react-dnd";
import "./ManagerTaskCard.css";
import { ThemeContext } from "../../utils/ThemeContext";

const ITEM_TYPE = "ASSIGNED_TASK";

const ManagerTaskCard = ({ task }) => {
  const { theme } = useContext(ThemeContext);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="task-card"
      data-theme={theme}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
      }}
    >
      <h3>{task.title}</h3>
      <p><strong>Due Date:</strong> {task.dueDate}</p>
      <p><strong>Priority:</strong> {task.priority}</p>
      <p><strong>Status:</strong> {task.status}</p>
    </div>
  );
};

export default ManagerTaskCard;
