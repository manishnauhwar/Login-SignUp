import React, { useState, useContext } from "react";
import "./Navbar.css";
import { IoLogOutOutline, IoNotificationsOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { useNotifications } from "../../utils/NotificationContext";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../utils/ThemeContext";

const Navbar = ({ handleLogout, isSidebarOpen, searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const { notifications, markAllAsRead, clearNotifications } = useNotifications();
  const { theme } = useContext(ThemeContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const handleProfile = () => {
    navigate("/profile");
  };
  return (
    <div className={`top-nav ${isSidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"}`} data-theme={theme}>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search tasks"
          title="Search tasks"
        />
      </div>
      <div className="nav-actions">
        <div className="notification-container">
          <button
            className="nav-btn notification-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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
                <>
                  <ul>
                    {notifications.map((notification) => (
                      <li key={notification.id} className={notification.read ? "read" : "unread"}>
                        {notification.message}
                      </li>
                    ))}
                  </ul>
                  <div className="notification-actions">
                    <button onClick={markAllAsRead}>Mark all as read</button>
                    <button onClick={clearNotifications}>Clear all</button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <button className="nav-btn profile-btn" title="View Profile" onClick={handleProfile}>
          Profile <CgProfile className="profile-icon" />
        </button>
        <button onClick={handleLogout} className="nav-btn logout" title="Logout">
          <IoLogOutOutline /> Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
