import React, { useState, useContext, useRef, useEffect } from "react";
import "./Navbar.css";
import { IoLogOutOutline, IoNotificationsOutline, IoTrashOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { BsSun, BsMoon } from "react-icons/bs";
import { useNotifications } from "../../utils/NotificationContext";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../utils/ThemeContext";
import { LanguageContext } from "../../utils/LanguageContext";

const Navbar = ({ handleLogout, isSidebarOpen, searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const { notifications, markAsRead, deleteNotification } = useNotifications();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { translate } = useContext(LanguageContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleMarkAsRead = (notification) => {
    if (notification && !notification.read) {
      markAsRead(notification._id);
    }
  };

  const handleDeleteNotification = (e, notification) => {
    e.stopPropagation();
    deleteNotification(notification._id);
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    setIsDropdownOpen(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`top-nav ${isSidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"}`} data-theme={theme}>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery || ""}
          onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
          aria-label="Search tasks"
          title="Search tasks"
        />
      </div>
      <div className="nav-actions">
        <button
          className="nav-btn theme-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? <BsMoon className="theme-icon" /> : <BsSun className="theme-icon" />}
        </button>
        <div className="notification-container" ref={dropdownRef}>
          <button
            className="nav-btn notification-btn"
            onClick={toggleDropdown}
            title="Notifications"
          >
            <IoNotificationsOutline className="notification-icon" />
            {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
          </button>
          {isDropdownOpen && (
            <div className="notification-dropdown">
              {notifications.length === 0 ? (
                <p className="no-notifications">No notifications</p>
              ) : (
                <ul>
                  {notifications.map((notification) => (
                    <li
                      key={notification._id}
                      className={notification.read ? "read" : "unread"}
                    >
                      <div className="notification-content" onClick={() => handleMarkAsRead(notification)}>
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-message">{notification.message}</div>
                      </div>
                      <div className="notification-actions">
                        <button
                          className="notification-action-btn"
                          onClick={(e) => handleDeleteNotification(e, notification)}
                          title="Delete notification"
                        >
                          <IoTrashOutline />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <button className="nav-btn profile-btn" title="View Profile" onClick={handleProfile}>
          <span>{translate("profile")}</span> <CgProfile className="profile-icon" />
        </button>
        <button onClick={handleLogout} className="nav-btn logout" title="Logout">
          <IoLogOutOutline /> <span>{translate("logout")}</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
