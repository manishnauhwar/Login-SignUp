import { useNavigate } from "react-router-dom";
import { logout } from "../../utils/auth";
import Sidebar from "../sidebar/Sidebar";
import { useState, useEffect, useContext } from "react";
import DueDateTableWithModal from "./DueDateModel";
import TaskPriorityChart from "../../charts/TaskPriorityChart";
import TaskStatusChart from "../../charts/TaskStatusChart";
import TaskSummaryCard from "./TaskSummaryCard";
import TaskStatsOverYear from "../../charts/TaskStatsOverYear";
import { ThemeContext } from "../../utils/ThemeContext";
import "./Dashboard.css";
import Main from "../Title/Main";
import Navbar from "../Navbar/Navbar";
import axiosInstance from "../../utils/axiosInstance";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const [taskStats, setTaskStats] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
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

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get("/stat/");
      setTaskStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get("/tasks");
      if (response.data) {
        const transformedTasks = response.data.map((task) => ({
          id: task._id,
          title: task.title || "",
          description: task.description || "",
          status: task.status || "To Do",
          priority: task.priority || "Low",
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
          createdAt: task.createdAt ? new Date(task.createdAt).toISOString().split("T")[0] : "",
          assignedTo: task.assignedTo || "",
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
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
      fetchStats();
    }
  }, [navigate, user, teamMembers]);

  useEffect(() => {
    fetchStats();
  }, [tasks]);

  const calculateTaskSummary = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.status && task.status.toLowerCase() === "completed").length;
    const overdueTasks = tasks.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return dueDate < today && task.status !== "Completed";
    }).length;
    const TaskTodo = tasks.filter((task) => task.status.toLowerCase() === "to do").length;
    const TaskInProgress = tasks.filter((task) => task.status.toLowerCase() === "in progress").length;

    const tasksForToday = tasks.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return dueDate.toDateString() === today.toDateString();
    }).length;
    return { totalTasks, overdueTasks, completedTasks, tasksForToday, TaskTodo, TaskInProgress };
  };

  const { totalTasks, overdueTasks, completedTasks, tasksForToday, TaskTodo, TaskInProgress } = calculateTaskSummary();

  return (
    <div className="home-container" data-theme={theme}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <Navbar handleLogout={handleLogout} isSidebarOpen={isSidebarOpen} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
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
                <TaskSummaryCard totalTasks={totalTasks} completedTasks={completedTasks} overdueTasks={overdueTasks} tasksForToday={tasksForToday} TaskTodo={TaskTodo} TaskInProgress={TaskInProgress} />
                <div className="previousyear">
                  {tasks.length > 0 && <TaskStatusChart tasks={tasks} />}
                  {tasks.length > 0 && <TaskPriorityChart tasks={tasks} />}
                  {taskStats.length > 0 && <TaskStatsOverYear taskStats={taskStats} />}
                </div>
              </div>
              <div className="data-table">
                <DueDateTableWithModal tasks={tasks} setTasks={setTasks} searchQuery={searchQuery} userId={user?._id || user?.id} userRole={user?.role} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
