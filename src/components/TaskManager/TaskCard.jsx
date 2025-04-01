import React, { useContext } from "react";
import { useDrag } from "react-dnd";
import { ThemeContext } from "../../utils/ThemeContext";
import "./TaskCard.css";
import axiosInstance from "../../utils/axiosInstance";
import { useNotifications } from "../../utils/NotificationContext";

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

const TaskCard = ({ task, onDelete }) => {
  const { theme } = useContext(ThemeContext);
  const { addNotification } = useNotifications();
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { _id: task._id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/tasks/${task._id}`);
      addNotification(`Task "${task.title}" deleted successfully`);
      if (onDelete) {
        onDelete(task._id);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      addNotification("Failed to delete task");
    }
  };

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
      <div className="task-header">
        <h3>{task.title}</h3>
        {(task.userRole === 'admin' || task.userRole === 'manager') && (
          <button
            className="delete-button"
            onClick={handleDelete}
            title="Delete task"
          >
            ×
          </button>
        )}
      </div>
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
