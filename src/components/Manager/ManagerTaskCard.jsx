import React, { useContext } from "react";
import { useDrag } from "react-dnd";
import "./ManagerTaskCard.css";
import { ThemeContext } from "../../utils/ThemeContext";

const ITEM_TYPE = "ASSIGNED_TASK";

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const ManagerTaskCard = ({ task }) => {
  const { theme } = useContext(ThemeContext);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { id: task._id },
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
      <p><strong>Due:</strong> {formatDate(task.dueDate)}</p>
      <p data-priority={task.priority}><strong>Priority:</strong> {task.priority}</p>
      <p><strong>Status:</strong> {task.status}</p>
    </div>
  );
};

export default ManagerTaskCard;
