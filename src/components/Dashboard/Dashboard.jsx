import { useNavigate } from 'react-router-dom';
import { logout } from '../../utils/auth';
import Sidebar from '../sidebar/Sidebar';
import { useState, useEffect, useContext } from 'react';
import DueDateTableWithModal from './DueDateModel';
import TaskPriorityChart from '../../charts/TaskPriorityChart';
import TaskStatusChart from '../../charts/TaskStatusChart';
import TaskSummaryCard from '../TaskManager/TaskSummaryCard';
import TaskStatsOverYear from '../../charts/TaskStatsOverYear';
import { ThemeContext } from '../../utils/ThemeContext';
import './Dashboard.css';
import Main from '../Title/Main';
import Navbar from '../Navbar/Navbar';
import axiosInstance from '../../utils/axiosInstance';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const [taskStats, setTaskStats] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/stat/');
      setTaskStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get('/tasks');


      if (response.data) {
        const transformedTasks = response.data.map(task => ({
          id: task._id,
          title: task.title || '',
          description: task.description || '',
          status: task.status || 'To Do',
          priority: task.priority || 'Low',
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
          createdAt: task.createdAt ? new Date(task.createdAt).toISOString().split('T')[0] : '',
          assignedTo: task.assignedTo || '',
          userId: task.userId
        }));

        setTasks(transformedTasks);
      } else {
        console.warn('No data in response');
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [navigate]);

  const calculateTaskSummary = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      task => task.status && task.status.toLowerCase() === 'completed'
    ).length;
    const overdueTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return dueDate < today && task.status !== 'Completed';
    }).length;
    const tasksForToday = tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return dueDate.toDateString() === today.toDateString();
    }).length;
    return { totalTasks, overdueTasks, completedTasks, tasksForToday };
  };

  const { totalTasks, overdueTasks, completedTasks, tasksForToday } = calculateTaskSummary();

  return (
    <div className="home-container" data-theme={theme}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Navbar
          handleLogout={handleLogout}
          isSidebarOpen={isSidebarOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <Main />
        <div>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading tasks...</p>
            </div>
          ) : (
            <>
              <div className="dashboard-content">
                <TaskSummaryCard
                  totalTasks={totalTasks}
                  completedTasks={completedTasks}
                  overdueTasks={overdueTasks}
                  tasksForToday={tasksForToday}
                />
                <div className="previousyear">
                  {tasks.length > 0 && <TaskStatusChart tasks={tasks} />}
                  {tasks.length > 0 && <TaskPriorityChart tasks={tasks} />}
                  {taskStats.length > 0 && <TaskStatsOverYear taskStats={taskStats} />}
                </div>
              </div>
              <div className='data-table'>
                <DueDateTableWithModal
                  tasks={tasks}
                  setTasks={setTasks}
                  searchQuery={searchQuery}
                  userId={user?.id}
                  userRole={user?.role}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
