import React, { useState, useContext } from "react";
import { logout } from "../../utils/auth";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import Main from "../Title/Main";
import { ThemeContext } from "../../utils/ThemeContext";
import "./Settings.css";

const Settings = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [notifications, setNotifications] = useState({

    email: JSON.parse(localStorage.getItem("emailNotifications")) || false,
    inApp: JSON.parse(localStorage.getItem("inAppNotifications")) || false,
  });

  const [language, setLanguage] = useState(localStorage.getItem("language") || "English");
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleNotificationChange = (type) => {
    setNotifications((prev) => {
      const updated = { ...prev, [type]: !prev[type] };
      localStorage.setItem(`${type}Notifications`, JSON.stringify(updated[type]));
      return updated;
    });
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    localStorage.setItem("language", e.target.value);
  };

  return (
    <div className="home-container" data-theme={theme}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <Navbar handleLogout={handleLogout} isSidebarOpen={isSidebarOpen} />
        <Main />
        <div className="settings-container">
          <div className="settings-nav">
            <div className="settings-item">
              <label>Email Notifications</label>
              <input type="checkbox" checked={notifications.email} onChange={() => handleNotificationChange("email")} />
            </div>
            <div className="settings-item">
              <label>In-App Notifications</label>
              <input type="checkbox" checked={notifications.inApp} onChange={() => handleNotificationChange("inApp")} />
            </div>
            <div className="settings-item">
              <label>Language</label>
              <select value={language} onChange={handleLanguageChange}>
                <option value="English">English</option>

                <option value="Hindi">Hindi</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="Japanese">Japanese</option>
                <option value="Arabic">Arabic</option>
                <option value="Bengali">Bengali</option>
                <option value="Russian">Russian</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Urdu">Urdu</option>
              </select>
            </div>
            <div className="settings-item">
              <label>Theme</label>
              <div className={`toggle-switch ${theme === "dark" ? "active" : ""}`} onClick={toggleTheme}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
