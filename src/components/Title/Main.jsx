import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import './Main.css';
import Pagetitle from './Pagetitle';
import { LanguageContext } from '../../utils/LanguageContext';

const Main = () => {
  const location = useLocation();
  const { translate } = useContext(LanguageContext);

  const getPageTitle = () => {
    const path = location.pathname.replace("/", "").replace("-", " ");

    if (!path) return translate("dashboard");

    const pathToKey = {
      "dashboard": "dashboard",
      "settings": "settings",
      "profile": "profile",
      "task management": "tasks",
      "kanbanboard": "kanban",
      "users": "users",
      "team": "teams",
      "manager": "manager"
    };

    return pathToKey[path] ? translate(pathToKey[path]) : path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <main id="main" className="main">
      <Pagetitle page={getPageTitle()} />
    </main>
  );
};

export default Main;
