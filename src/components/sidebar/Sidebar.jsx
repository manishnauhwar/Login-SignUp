import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { FaTachometerAlt, FaTasks, FaUserCog, FaUsers, FaCog } from "react-icons/fa";
import { RiTeamLine } from "react-icons/ri";
import { LuKanban } from "react-icons/lu";
import "./Sidebar.css";
import { ThemeContext } from "../../utils/ThemeContext";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { theme } = useContext(ThemeContext);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/users/U6")
      .then((response) => response.json())
      .then((data) => setUserRole(data.role))
      .catch((error) => console.error("Error fetching user role:", error));
  }, []);

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`} data-theme={theme}>
      <div className="sidebar-header">
        <button className="toggle-button" onClick={() => setIsOpen(!isOpen)}>
          <div className={`arrow ${isOpen ? "left" : "right"}`}></div>
        </button>
        <h2 className="logo">{isOpen ? "Excellence Hub" : ""}</h2>
      </div>
      <div className="sidebar-list">
        <Link to="/dashboard" className="sidebar-item">
          <FaTachometerAlt className="icon" /> <span className="link-text">Dashboard</span>
        </Link>
        <Link to="/task-management" className="sidebar-item">
          <FaTasks className="icon" /> <span className="link-text">Task Management</span>
        </Link>
        <Link to="/kanbanboard" className="sidebar-item">
          <LuKanban className="icon" /> <span className="link-text">Kanban Board</span>
        </Link>
        <Link to="/team" className="sidebar-item">
          <RiTeamLine className="icon" /> <span className="link-text">Team</span>
        </Link>
        <Link to="/manager" className="sidebar-item">
          <FaUserCog className="icon" /> <span className="link-text">Manager</span>
        </Link>
        <Link to="/users" className="sidebar-item">
          <FaUsers className="icon" /> <span className="link-text">Users</span>
        </Link>
        <Link to="/settings" className="sidebar-item">
          <FaCog className="icon" /> <span className="link-text">Settings</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
