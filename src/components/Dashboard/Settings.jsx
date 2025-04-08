import React, { useState, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { logout } from "../../utils/auth";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import Main from "../Title/Main";
import { ThemeContext } from "../../utils/ThemeContext";
import { LanguageContext } from "../../utils/LanguageContext";
import { useNotifications } from "../../utils/NotificationContext";
import axiosInstance from "../../utils/axiosInstance";
import "./Settings.css";

const languages = {
  English: {
    flag: "🇺🇸",
    name: "English"
  },
  Arabic: {
    flag: "🇸🇦",
    name: "العربية"
  },
  Bengali: {
    flag: "🇧🇩",
    name: "বাংলা"
  },
  Hindi: {
    flag: "🇮🇳",
    name: "हिन्दी"
  }
};

const Settings = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { language, changeLanguage, translate, translations } = useContext(LanguageContext);
  const { t } = useTranslation();
  const { fetchNotifications } = useNotifications();
  const [notifications, setNotifications] = useState({
    email: false,
    inApp: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchNotificationPreferences = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/notifications/preferences');

        if (response.data.preferences) {
          const prefs = response.data.preferences;
          setNotifications({
            email: prefs.email === true,
            inApp: prefs.inApp !== false,
          });

          localStorage.setItem("emailNotifications", JSON.stringify(prefs.email === true));
          localStorage.setItem("inAppNotifications", JSON.stringify(prefs.inApp !== false));
        }
      } catch (error) {
        console.error('Error fetching notification preferences:', error);
        setNotifications({
          email: JSON.parse(localStorage.getItem("emailNotifications")) || false,
          inApp: JSON.parse(localStorage.getItem("inAppNotifications")) !== false,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationPreferences();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleNotificationChange = async (type) => {
    try {
      setLoading(true);
      const updatedPreferences = {
        ...notifications,
        [type]: !notifications[type]
      };
      setNotifications(updatedPreferences);

      localStorage.setItem(`${type}Notifications`, JSON.stringify(updatedPreferences[type]));


      const response = await axiosInstance.patch('/notifications/preferences', {
        [type]: updatedPreferences[type]
      });


      if (type === 'inApp' && updatedPreferences[type]) {
        fetchNotifications();
      }

      setMessage({
        text: t("notificationSettingsUpdated", "Notification settings updated successfully"),
        type: "success"
      });

      setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 3000);
    } catch (error) {
      console.error(`Error updating ${type} notification setting:`, error);
      setNotifications(prev => ({ ...prev, [type]: !prev[type] }));
      localStorage.setItem(`${type}Notifications`, JSON.stringify(!notifications[type]));

      setMessage({
        text: t("notificationUpdateError", "Failed to update notification settings: {{errorMessage}}",
          { errorMessage: error.message }),
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    changeLanguage(newLanguage);

    // Show confirmation message
    setMessage({
      text: t("languageChanged", "Language changed to {{language}}", { language: languages[newLanguage]?.name || newLanguage }),
      type: "success"
    });

    setTimeout(() => {
      setMessage({ text: "", type: "" });
    }, 3000);
  };

  // Filter available languages to only those with translations
  const availableLanguages = Object.keys(translations).filter(lang =>
    languages[lang] !== undefined
  );

  return (
    <div className="home-container" data-theme={theme}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <Navbar handleLogout={handleLogout} isSidebarOpen={isSidebarOpen} />
        <Main />
        <div className="settings-container">
          {message.text && (
            <div className={`settings-message ${message.type}`}>
              {message.text}
            </div>
          )}
          <div className="settings-nav">
            <div className="settings-item">
              <label>{t("emailNotifications")}</label>
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={() => handleNotificationChange("email")}
                disabled={loading}
              />
              {notifications.email && (
                <small className="setting-description">
                  {t("emailNotificationsDesc", "You will receive email notifications")}
                </small>
              )}
            </div>
            <div className="settings-item">
              <label>{t("inAppNotifications")}</label>
              <input
                type="checkbox"
                checked={notifications.inApp}
                onChange={() => handleNotificationChange("inApp")}
                disabled={loading}
              />
              {notifications.inApp && (
                <small className="setting-description">
                  {t("inAppNotificationsDesc", "You will receive in-app notifications")}
                </small>
              )}
            </div>
            <div className="settings-item language-settings">
              <label>{t("language")}</label>
              <div className="language-selector">
                <select value={language} onChange={handleLanguageChange} className="language-select">
                  {availableLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                      {languages[lang]?.flag} {languages[lang]?.name || lang}
                    </option>
                  ))}
                </select>
              </div>
              <div className="language-flags">
                {availableLanguages.map((lang) => (
                  <span
                    key={lang}
                    className={`language-flag ${language === lang ? 'active' : ''}`}
                    onClick={() => handleLanguageChange({ target: { value: lang } })}
                    title={languages[lang]?.name || lang}
                  >
                    {languages[lang]?.flag}
                  </span>
                ))}
              </div>
            </div>
            <div className="settings-item">
              <label>{t("theme")}</label>
              <div className={`toggle-switch ${theme === "dark" ? "active" : ""}`} onClick={toggleTheme}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
