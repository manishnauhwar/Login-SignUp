import React from "react";
import { Link } from "react-router-dom";
import { FaTasks,FaTachometerAlt, FaUserCog, FaUsers, FaCog } from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = ({ isOpen, setIsOpen }) => {
  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
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
