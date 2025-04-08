import React, { useContext } from "react";
import { useDrag } from "react-dnd";
import { ThemeContext } from "../../utils/ThemeContext";
import "./TaskCard.css";
import axiosInstance from "../../utils/axiosInstance";
import { useNotifications } from "../../utils/NotificationContext";

const ITEM_TYPE = "TASK";

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

const TaskCard = ({ task, onDelete }) => {
  const { theme } = useContext(ThemeContext);
  const { createNotification } = useNotifications();
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
      createNotification({
        type: 'task_deleted',
        title: 'Task Deleted',
        message: `Task "${task.title}" has been deleted`,
        recipient: task.assignedTo || task.userId,
        sender: JSON.parse(localStorage.getItem('user')).id,
        link: '/tasks'
      });
      if (onDelete) {
        onDelete(task._id);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      createNotification({
        type: 'task_updated',
        title: 'Error',
        message: 'Failed to delete task',
        recipient: JSON.parse(localStorage.getItem('user')).id,
        sender: JSON.parse(localStorage.getItem('user')).id
      });
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

export default TaskCard;
