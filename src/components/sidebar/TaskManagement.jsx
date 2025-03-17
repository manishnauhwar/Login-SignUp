import React, { useState, useEffect } from 'react';
import './TaskManagement.css';
import Sidebar from './Sidebar';
import Navbar from '../Dashboard/Navbar';
import Main from '../Main';
import { useNavigate } from 'react-router-dom';
import DueDateTableWithModal from '../Dashboard/DueDateModel';
import { logout } from '../../utils/auth';
import SortTasks from '../Dashboard/SortTasks';

const TaskManagement = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [originalTasks, setOriginalTasks] = useState(tasks);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/tasks');
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setOriginalTasks(tasks);
  }, [tasks]);

  
  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };


  return (
    <div className="home-container">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Navbar handleLogout={handleLogout} isSidebarOpen={isSidebarOpen} />
        <Main />
        <SortTasks tasks={tasks} setTasks={setTasks} setOriginalTasks={setOriginalTasks} />

        <div className='data-table'>
          {loading ? <p>Loading...</p> : <DueDateTableWithModal tasks={originalTasks} setTasks={setTasks} />}
        </div>
      </div>
    </div>
  );
};

export default TaskManagement;
