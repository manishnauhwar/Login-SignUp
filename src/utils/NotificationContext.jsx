import { createContext, useState, useContext, useEffect, useCallback } from "react";
import axiosInstance from "./axiosInstance";
import { isAuthenticated, getUser } from "./auth";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated()) return;

    try {
      setLoading(true);
      const response = await axiosInstance.get('/notifications');
      const currentUser = getUser();
      if (currentUser && currentUser.id) {
        const userNotifications = response.data.filter(
          notification => notification.recipient === currentUser.id
        );
        setNotifications(userNotifications);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = () => {
      if (isAuthenticated()) {
        fetchNotifications();
      }
    };

    fetchData();

    window.addEventListener('auth-change', fetchData);

    return () => {
      window.removeEventListener('auth-change', fetchData);
    };
  }, [fetchNotifications]);

  const createNotification = useCallback(async (notificationData) => {
    if (!isAuthenticated()) return null;

    try {
      const response = await axiosInstance.post('/notifications', notificationData);
      const newNotification = response.data.notification || response.data;
      const currentUser = getUser();
      if (currentUser && currentUser.id === notificationData.recipient) {
        setNotifications(prev => [newNotification, ...prev]);
      }
      return newNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    if (!isAuthenticated()) return;

    try {
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      await axiosInstance.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    if (!isAuthenticated()) return;

    try {
      await axiosInstance.delete(`/notifications/${notificationId}`);
      setNotifications(prev =>
        prev.filter(notification => notification._id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loading,
        createNotification,
        markAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  return useContext(NotificationContext);
};
