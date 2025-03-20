import { useNavigate } from 'react-router-dom';
import { logout } from '../../utils/auth';
import Sidebar from '../sidebar/Sidebar';
import { useState, useEffect, useContext } from 'react';
import DueDateTableWithModal from './DueDateModel';
import TaskPriorityChart from '../../charts/TaskPriorityChart';
import TaskStatusChart from '../../charts/TaskStatusChart';
import TaskStatsOverYears from '../../charts/TaskStatsOverYear';
import TaskSummaryCard from '../TaskManager/TaskSummaryCard';
import { ThemeContext } from '../../utils/ThemeContext';
import './Dashboard.css';
import Main from '../Title/Main';
import Navbar from '../Navbar/Navbar';
const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [taskStats, setTaskStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme } = useContext(ThemeContext);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasksRes = await fetch('http://localhost:5000/tasks');
        const tasksData = await tasksRes.json();
        const statsRes = await fetch('http://localhost:5000/taskStatistics');
        const statsData = await statsRes.json();
        setTasks(tasksData);
        setTaskStats(statsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calculateTaskSummary = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      task => task.status && task.status.toLowerCase() === 'completed'
    ).length;
    const overdueTasks = tasks.filter(
      task => task.status && task.status.toLowerCase() === 'overdue'
    ).length;
    const tasksForToday = tasks.filter(task => {
      const today = new Date().toISOString().split('T')[0];
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      if (isNaN(dueDate.getTime())) return false;
      const taskDate = dueDate.toISOString().split('T')[0];
      return taskDate === today;
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
            <p>Loading...</p>
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
                  {taskStats.length > 0 && <TaskStatsOverYears taskStats={taskStats} />}   
                  {tasks.length > 0 && <TaskStatusChart tasks={tasks} />}
                  {tasks.length > 0 && <TaskPriorityChart tasks={tasks} />}
                </div>
              </div>
              <div className='data-table'>
                <DueDateTableWithModal 
                  tasks={tasks} 
                  setTasks={setTasks} 
                  searchQuery={searchQuery} 
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
