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
import axiosInstance from '../../utils/axiosInstance';

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
        const response = await axiosInstance.get('/tasks');
        const data = response.data || [];

        const transformedTasks = data.map(task => ({
          id: task._id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: new Date(task.dueDate).toISOString().split('T')[0],
          createdAt: new Date(task.createdAt).toISOString().split('T')[0],
          assignedTo: task.assignedTo || '',
          userId: task.userId
        }));

        setTasks(transformedTasks);
        setOriginaltasks(transformedTasks);
        setAllTasks(transformedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setTasks([]);
        setOriginaltasks([]);
        setAllTasks([]);
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
