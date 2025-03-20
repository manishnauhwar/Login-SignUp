import React, { useState, useEffect, useContext } from 'react';
import './TaskManagement.css';
import Sidebar from '../sidebar/Sidebar';
import Navbar from '../Navbar/Navbar';
import Main from '../Title/Main';
import { useNavigate } from 'react-router-dom';
import DueDateTableWithModal from '../Dashboard/DueDateModel';
import { logout } from '../../utils/auth';
import SortTasks from '../TaskManager/SortTasks';
import { ThemeContext } from "../../utils/ThemeContext";

const TaskManagement = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [originaltasks, setOriginaltasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/tasks');
        const data = await response.json();
        setTasks(data);
        setOriginaltasks(data);
        setAllTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filteredTasks = searchQuery
      ? allTasks.filter((task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : allTasks;
    setTasks(filteredTasks);
  }, [searchQuery, allTasks]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="home-container" data-theme={theme}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} data-theme={theme}>
        <Navbar
          handleLogout={handleLogout}
          isSidebarOpen={isSidebarOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <Main />
        <SortTasks tasks={tasks} setTasks={setTasks} fullData={allTasks} setFullData={setAllTasks} />
        <div className='data-table'>
          {loading ? <p>Loading...</p> : <DueDateTableWithModal tasks={tasks} setTasks={setTasks} searchQuery={searchQuery} />}
        </div>
      </div>
    </div>
  );
};

export default TaskManagement;
