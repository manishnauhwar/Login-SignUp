import React, { useState, useEffect, useContext } from "react";
import { logout } from "../../utils/auth";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import Main from "../Title/Main";
import "./User.css";
import { ThemeContext } from "../../utils/ThemeContext";
import axiosInstance from "../../utils/axiosInstance";

const User = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const { theme } = useContext(ThemeContext);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      const enhancedUser = {
        ...userData,
        _id: userData._id || userData.id,
        id: userData._id || userData.id
      };
      setUser(enhancedUser);
    }
  }, []);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (user?.role === 'manager') {
        try {
          const response = await axiosInstance.get('/teams');
          const teams = response.data;
          const userId = user._id || user.id;
          const userTeam = teams.find(team =>
            team.manager._id === userId || team.manager.id === userId
          );
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
    const fetchTasks = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData) {
          navigate("/login");
          return;
        }

        const userId = userData._id || userData.id;
        if (!userId) {
          console.error("Missing user ID:", userData);
          return;
        }

        const response = await axiosInstance.get("/tasks");
        const data = response.data || [];

        const transformedTasks = data.map(task => ({
          _id: task._id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: new Date(task.dueDate).toISOString().split('T')[0],
          createdAt: new Date(task.createdAt).toISOString().split('T')[0],
          assignedTo: task.assignedTo || '',
          userId: task.userId
        }));

        let userTasks = [];

        if (userData.role === "admin") {
          userTasks = transformedTasks;
        } else if (userData.role === "manager") {
          userTasks = transformedTasks.filter(task =>
            task.assignedTo === userId ||
            task.userId === userId ||
            teamMembers.includes(task.assignedTo)
          );
        } else {
          userTasks = transformedTasks.filter(task =>
            task.assignedTo === userId || task.userId === userId
          );
        }

        setAllTasks(userTasks);
        setTasks(userTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setTasks([]);
        setAllTasks([]);
      }
    };

    if (user) {
      fetchTasks();
    }
  }, [user, navigate, teamMembers]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setTasks(allTasks);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = allTasks.filter(task =>
        task.title.toLowerCase().includes(lowercaseQuery) ||
        task.description.toLowerCase().includes(lowercaseQuery) ||
        task.priority.toLowerCase().includes(lowercaseQuery) ||
        task.status.toLowerCase().includes(lowercaseQuery)
      );
      setTasks(filtered);
    }
  }, [searchQuery, allTasks]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/users/alluser");
        const usersData = response.data.allUsers || [];
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

  const getUserInitials = (userId) => {
    const foundUser = users.find((u) =>
      u._id === userId || u.id === userId
    );

    if (foundUser && foundUser.fullname) {
      return foundUser.fullname.toUpperCase();
    }
    return "NA";
  };

  const getfullnameById = (userId) => {
    const foundUser = users.find((u) =>
      u._id === userId || u.id === userId
    );
    return foundUser ? foundUser.fullname : "Unknown User";
  };

  return (
    <div className="home-container" data-theme={theme}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`} data-theme={theme}>
        <Navbar
          handleLogout={handleLogout}
          isSidebarOpen={isSidebarOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <Main />
        <div className="cards-container">
          <div className="tasks-card">
            <h2>My Tasks</h2>
            {tasks.length > 0 ? (
              <ul className="tasks-list">
                {tasks.map(task => (
                  <li key={task._id} className="task-item">
                    <div className="task-header">
                      <h3>{task.title}</h3>
                      <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="task-description">{task.description}</p>
                    <div className="task-footer">
                      <span className="due-date">Due: {formatDate(task.dueDate)}</span>
                      <span className={`status-badge ${task.status.toLowerCase()}`}>
                        {task.status}
                      </span>
                      <div
                        className="user-initial-badge"
                        title={getfullnameById(task.assignedTo)}
                      >
                        {getUserInitials(task.assignedTo)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-tasks">No tasks assigned to you.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;