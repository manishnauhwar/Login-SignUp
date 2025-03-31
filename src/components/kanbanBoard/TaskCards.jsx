import React, { useContext } from "react";
import { useDrag } from "react-dnd";
import { ThemeContext } from "../../utils/ThemeContext";
import "./TaskCards.css";

const ITEM_TYPE = "TASK";

const getPriorityStyle = (priority) => {
  if (!priority) {
    return { backgroundColor: "#ddd", color: "black" };
  }
  switch (priority.toLowerCase()) {
    case "high":
      return { backgroundColor: "#ff6b6b", color: "white" };
    case "medium":
      return { backgroundColor: "#ffb74d", color: "white" };
    case "low":
      return { backgroundColor: "#4caf50", color: "white" };
    default:
      return { backgroundColor: "#ddd", color: "black" };
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const TaskCards = ({ task }) => {
  const { theme } = useContext(ThemeContext);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { _id: task._id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="task-cards"
      data-theme={theme}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
        backgroundColor: isDragging ? "#f0f0f0" : "white"
      }}
    >
      <h3>{task.title}</h3>
      <p>
        <strong>Status:</strong>{" "}
        <span style={{
          ...getPriorityStyle(task.status),
          padding: "2px 8px",
          borderRadius: "12px",
          fontSize: "12px",
          textTransform: "capitalize"
        }}>
          {task.status}
        </span>
      </p>
      <p>
        <strong>Priority:</strong>{" "}
        <span style={{
          ...getPriorityStyle(task.priority),
          padding: "2px 8px",
          borderRadius: "12px",
          fontSize: "12px",
          textTransform: "capitalize"
        }}>
          {task.priority}
        </span>
      </p>
      <p className="due-date">
        <strong>Due:</strong> {formatDate(task.dueDate)}
      </p>
    </div>
  );
};

export default TaskCards;
