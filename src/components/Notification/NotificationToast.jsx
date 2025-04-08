import React, { useEffect, useState } from 'react';
import './NotificationToast.css';

const NotificationToast = ({ notification, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fadeTimeout = setTimeout(() => {
      setVisible(false);
    }, 3000);

    const removeTimeout = setTimeout(() => {
      onClose();
    }, 3500);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(removeTimeout);
    };
  }, [onClose]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'task_assigned':
        return { icon: '📋', color: '#4caf50' };
      case 'task_completed':
        return { icon: '✅', color: '#2196f3' };
      case 'task_updated':
        return { icon: '🔄', color: '#ff9800' };
      case 'task_deleted':
        return { icon: '🗑️', color: '#f44336' };
      default:
        return { icon: '📣', color: '#607d8b' };
    }
  };

  const { icon, color } = getTypeIcon(notification.type);

  return (
    <div className={`notification-toast ${visible ? 'visible' : 'hidden'}`} style={{ borderLeft: `4px solid ${color}` }}>
      <div className="notification-icon" style={{ backgroundColor: `${color}20` }}>
        {icon}
      </div>
      <div className="notification-content">
        <h4>{notification.title}</h4>
        <p>{notification.message}</p>
      </div>
      <button className="close-button" onClick={() => setVisible(false)}>
        &times;
      </button>
    </div>
  );
};

export default NotificationToast; 