import { createContext, useState, useContext, useEffect, useCallback } from "react";
import axiosInstance from "./axiosInstance";
import { isAuthenticated, getUser } from "./auth";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from 'uuid';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  const addToast = useCallback((notification) => {
    const toast = {
      ...notification,
      id: notification._id || uuidv4(),
    };
    setToasts(prev => [toast, ...prev]);

    setTimeout(() => {
      removeToast(toast.id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  useEffect(() => {
    if (isAuthenticated()) {
      const user = getUser();
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

      const newSocket = io(BACKEND_URL);
      setSocket(newSocket);

      if (user && user.id) {
        newSocket.emit('join', user.id);
      }

      newSocket.on('notification', (notification) => {
        const inAppEnabled = JSON.parse(localStorage.getItem("inAppNotifications"));
        if (inAppEnabled !== false) { 
          setNotifications(prev => [notification, ...prev]);

          addToast(notification);
        }
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [addToast]);

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
        const inAppEnabled = JSON.parse(localStorage.getItem("inAppNotifications"));
        if (inAppEnabled !== false) {
          setNotifications(prev => [newNotification, ...prev]);

          addToast(newNotification);
        }
      }

      return newNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }, [addToast]);

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
        toasts,
        loading,
        createNotification,
        markAsRead,
        deleteNotification,
        fetchNotifications,
        addToast,
        removeToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  return useContext(NotificationContext);
};
