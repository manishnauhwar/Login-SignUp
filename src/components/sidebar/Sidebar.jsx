import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaTachometerAlt, FaTasks, FaUserCog, FaUsers, FaCog } from "react-icons/fa";
import { RiTeamLine } from "react-icons/ri";
import { LuKanban } from "react-icons/lu";
import "./Sidebar.css";
import { ThemeContext } from "../../utils/ThemeContext";
import { LanguageContext } from "../../utils/LanguageContext";
import { useTranslation } from "react-i18next";
import defaultProfileImg from "../../assets/profile.png";

const Sidebar = ({ isOpen = false, setIsOpen }) => {
  const { theme } = useContext(ThemeContext);
  const { translate } = useContext(LanguageContext);
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const getProfilePictureUrl = (relativePath) => {
    if (!relativePath) return defaultProfileImg;

    if (relativePath.startsWith('data:')) return relativePath;

    if (relativePath.startsWith('http')) return relativePath;

    const baseURL = window.location.origin.replace('3000', '5000');
    return baseURL + relativePath;
  };

  const getMenuItems = () => {
    const commonItems = [
      { path: '/dashboard', icon: <FaTachometerAlt className="icon" />, text: 'dashboard' },
      { path: '/task-management', icon: <FaTasks className="icon" />, text: 'taskManagement' },
      { path: '/kanbanboard', icon: <LuKanban className="icon" />, text: 'kanban' },
      { path: '/settings', icon: <FaCog className="icon" />, text: 'settings' }
    ];

    if (!user) {
      return commonItems;
    }

    const roleItems = {
      admin: [
        { path: '/users', icon: <FaUsers className="icon" />, text: 'users' },
        { path: '/team', icon: <RiTeamLine className="icon" />, text: 'teams' }
      ],
      manager: [
        { path: '/users', icon: <FaUsers className="icon" />, text: 'users' },
        { path: '/manager', icon: <FaUserCog className="icon" />, text: 'manager' }
      ],
      user: [
        { path: '/users', icon: <FaUsers className="icon" />, text: 'users' }
      ]
    };

    return [...commonItems, ...(roleItems[user.role] || [])];
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`} data-theme={theme}>
      <div className="sidebar-header">
        <button className="toggle-button" onClick={() => setIsOpen(!isOpen)}>
          <div className={`arrow ${isOpen ? "left" : "right"}`}></div>
        </button>
        <h2 className="logo">{isOpen ? t("taskManagement") : ""}</h2>
      </div>
      <div className="sidebar-list">
        {getMenuItems().map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            {item.icon}
            <span className="link-text">{t(item.text)}</span>
          </Link>
        ))}
      </div>
      {user && isOpen && (
        <div className="user-info">
          <Link to="/profile" className="profile-link" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-profile">
              <img
                src={getProfilePictureUrl(user.profilePicture)}
                alt="Profile"
                className="sidebar-profile-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultProfileImg;
                }}
              />
              <div className="sidebar-profile-info">
                <span className="user-name">{user.fullname}</span>
                <span className="user-role">{user.role}</span>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
