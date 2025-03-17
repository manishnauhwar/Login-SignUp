import { useNavigate } from 'react-router-dom';
import { logout } from '../../utils/auth';
import Sidebar from '../sidebar/Sidebar';
import Navbar from './Navbar';
import { useState, useEffect } from 'react';
import DueDateTableWithModal from './DueDateModel';
import TaskPriorityChart from '../../charts/TaskPriorityChart';
import TaskStatusChart from '../../charts/TaskStatusChart';
import TaskStatsOverYears from '../../charts/TaskStatsOverYear';
import TaskSummaryCard from '../TaskSummaryCard';
import './Dashboard.css';
import Main from '../Main';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [taskStats, setTaskStats] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const completedTasks = tasks.filter(task => task.status.toLowerCase() === 'completed').length;
    const overdueTasks = tasks.filter(task => task.status.toLowerCase() === 'overdue').length;
    const tasksForToday = tasks.filter(task => {
      const today = new Date().toISOString().split('T')[0];
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === today;
    }).length;
  
    return { totalTasks,overdueTasks, completedTasks, tasksForToday };
  };
  

  const { totalTasks, overdueTasks, completedTasks, tasksForToday } = calculateTaskSummary();

  return (
    <div className="home-container">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Navbar handleLogout={handleLogout} isSidebarOpen={isSidebarOpen} />
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
              <DueDateTableWithModal tasks={tasks} setTasks={setTasks} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
