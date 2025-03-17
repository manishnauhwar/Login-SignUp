import React from "react";
import "./Navbar.css";
import { IoLogOutOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";

const Navbar = ({ handleLogout, isSidebarOpen }) => {
  return (
    <div className={`top-nav ${isSidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"}`}>
      <div className="search-bar">
        <input type="text" placeholder="Search..." />
      </div>
      <div className="nav-actions">
        <button className="nav-btn profile-btn">
          Profile <CgProfile className="profile-icon" />
        </button>
        <button onClick={handleLogout} className="nav-btn logout">
          <IoLogOutOutline /> Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
