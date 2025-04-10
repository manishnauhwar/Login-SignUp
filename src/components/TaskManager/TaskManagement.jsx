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
import { LanguageContext } from "../../utils/LanguageContext";
import axiosInstance from '../../utils/axiosInstance';

const TaskManagement = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { translate, translateTaskContent } = useContext(LanguageContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [originaltasks, setOriginaltasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (user?.role === 'manager') {
        try {
          const response = await axiosInstance.get('/teams');
          const teams = response.data;
          const userTeam = teams.find(team => team.manager._id === user.id);
          if (userTeam) {
            setTeamMembers(userTeam.members.map(member => member._id));
          }
        } catch (error) {
          console.error('Error fetching team members:', error);
        }
      }
    };

    if (user) {
      fetchTeamMembers();
    }
  }, [user]);

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

        let filteredTasks = transformedTasks;
        const userId = user._id || user.id;

        if (user?.role === "user") {
          filteredTasks = transformedTasks.filter(task =>
            task.assignedTo === userId || task.userId === userId
          );
        } else if (user?.role === "manager") {
          filteredTasks = transformedTasks.filter(task =>
            task.assignedTo === userId || task.userId === userId || teamMembers.includes(task.assignedTo)
          );
        }

        setTasks(filteredTasks);
        setOriginaltasks(filteredTasks);
        setAllTasks(filteredTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setTasks([]);
        setOriginaltasks([]);
        setAllTasks([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, teamMembers]);

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
        <div className="task-management-content">
          <div className="sort-filter-container">
            <SortTasks tasks={tasks} setTasks={setTasks} fullData={allTasks} setFullData={setAllTasks} />
          </div>
          {loading ? (
            <p>{translate("loadingTasks")}</p>
          ) : (
            <DueDateTableWithModal
              tasks={tasks}
              setTasks={setTasks}
              searchQuery={searchQuery}
              userId={user?._id || user?.id}
              userRole={user?.role}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskManagement;
