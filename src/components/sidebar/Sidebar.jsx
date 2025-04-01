import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaTachometerAlt, FaTasks, FaUserCog, FaUsers, FaCog } from "react-icons/fa";
import { RiTeamLine } from "react-icons/ri";
import { LuKanban } from "react-icons/lu";
import "./Sidebar.css";
import { ThemeContext } from "../../utils/ThemeContext";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const getMenuItems = () => {
    const commonItems = [
      { path: '/dashboard', icon: <FaTachometerAlt className="icon" />, text: 'Dashboard' },
      { path: '/task-management', icon: <FaTasks className="icon" />, text: 'Task Management' },
      { path: '/kanbanboard', icon: <LuKanban className="icon" />, text: 'Kanban Board' },
      { path: '/settings', icon: <FaCog className="icon" />, text: 'Settings' }
      
    ];

    if (!user) {
      return commonItems;
    }


    const roleItems = {
      admin: [
        // { path: '/users', icon: <FaUsers className="icon" />, text: 'Users' },
        { path: '/team', icon: <RiTeamLine className="icon" />, text: 'Admin Panel' }
        
      ],
      manager: [
        { path: '/manager', icon: <FaUserCog className="icon" />, text: 'Manager Panel' }
      ],
      user: [
         { path: '/users', icon: <FaUsers className="icon" />, text: 'Users' }
        
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
        <h2 className="logo">{isOpen ? "Excellence Hub" : ""}</h2>
      </div>
      <div className="sidebar-list">
        {getMenuItems().map((item, index) => (
          <Link 
            key={index} 
            to={item.path} 
            className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
          >
            {item.icon}
            <span className="link-text">{item.text}</span>
          </Link>
        ))}
      </div>
      {user && (
        <div className="user-info">
          {/* <span className="user-role">{user.role}</span> */}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
