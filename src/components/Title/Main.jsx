import React from 'react';
import { useLocation } from 'react-router-dom';
import './Main.css';
import Pagetitle from './Pagetitle';

const Main = () => {
  const location = useLocation();
  const getPageTitle = () => {
    const path = location.pathname.replace("/", "").replace("-", " ");
    return path ? path.charAt(0).toUpperCase() + path.slice(1) : "Dashboard";
  };

  return (
    <main id="main" className="main">
      <Pagetitle page={getPageTitle()} />
    </main>
  );
};

export default Main;
