import React, { useContext } from "react";
import { useDrag } from "react-dnd";
import { ThemeContext } from "../../utils/ThemeContext";
import "./TaskCard.css";

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

const TaskCard = ({ task }) => {
  const { theme } = useContext(ThemeContext);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { _id: task._id },
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
        cursor: "grab"
      }}
    >
      <h3>{task.title}</h3>
      <p><strong>Status:</strong> {task.status}</p>
      <p>
        <strong>Priority:</strong>{" "}
        <span style={{ ...getPriorityStyle(task.priority), padding: "4px 8px", borderRadius: "5px", display: "inline-block" }}>
          {task.priority}
        </span>
      </p>
    </div>
  );
};

export default TaskCard;
