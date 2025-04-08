import React, { useContext } from "react";
import { useDrag } from "react-dnd";
import "./ManagerTaskCard.css";
import { ThemeContext } from "../../utils/ThemeContext";

const ITEM_TYPE = "ASSIGNED_TASK";

const getPriorityIcon = (priority) => {
  switch (priority) {
    case 'High':
      return 'fa-solid fa-circle-exclamation';
    case 'Medium':
      return 'fa-solid fa-exclamation';
    case 'Low':
      return 'fa-solid fa-circle-check';
    default:
      return 'fa-solid fa-circle';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Pending':
      return 'fa-solid fa-clock';
    case 'In progress':
      return 'fa-solid fa-spinner fa-spin';
    case 'To Do':
      return 'fa-solid fa-list-check';
    case 'Completed':
      return 'fa-solid fa-check';
    default:
      return 'fa-solid fa-circle';
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
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
      <div className="date-container">
        <i className="fa-regular fa-calendar"></i>
        <span>{formatDate(task.dueDate)}</span>
      </div>
      <div className="status-badges">
        <span className="badge" data-priority={task.priority}>
          <i className={getPriorityIcon(task.priority)}></i>
          {task.priority}
        </span>
        <span className="badge" data-status={task.status}>
          <i className={getStatusIcon(task.status)}></i>
          {task.status}
        </span>
      </div>
    </div>
  );
};

export default ManagerTaskCard;
