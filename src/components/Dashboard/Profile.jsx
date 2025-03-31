import React, { useState, useEffect, useContext } from "react";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../sidebar/Sidebar";
import { logout } from "../../utils/auth";
import "./Profile.css";
import profileImg from "../../assets/profile.png";
import Main from "../Title/Main";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../utils/ThemeContext";
import axiosInstance from "../../utils/axiosInstance";

const UserProfile = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskStats, setTaskStats] = useState({
    totalTasks: 0,
    avgCompletionTime: 0
  });
  const [allUsers, setAllUsers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  const calculateTimeDifference = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (end - start) / (1000 * 60 * 60); 
  };

  const fetchTaskStats = async (userId) => {
    try {
      const response = await axiosInstance.get('/tasks');
      const allTasks = response.data;

      const completedTasks = allTasks.filter(task =>
        task.assignedTo === userId && task.status === 'Completed'
      );


      const totalTasks = completedTasks.length;
      let totalTime = 0;

      completedTasks.forEach(task => {
        if (task.createdAt && task.updatedAt) {
          totalTime += calculateTimeDifference(task.createdAt, task.updatedAt);
        }
      });

      const avgCompletionTime = totalTasks > 0 ? totalTime / totalTasks : 0;

      setTaskStats({
        totalTasks,
        avgCompletionTime: avgCompletionTime.toFixed(2)
      });
    } catch (err) {
      console.error('Error fetching task statistics:', err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axiosInstance.get('/users/alluser');
      setAllUsers(response.data.allUsers);
    } catch (err) {
      console.error('Error fetching all users:', err);
    }
  };

  const fetchTeamMembers = async (managerId) => {
    try {
      const response = await axiosInstance.get('/teams');
      const teams = response.data;
      const managerTeam = teams.find(team => team.manager._id === managerId);
      if (managerTeam) {
        setTeamMembers(managerTeam.members);
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));


        if (!storedUser) {
          navigate('/login');
          return;
        }

        const userId = storedUser._id || storedUser.id;
        if (!userId) {
          console.error('Invalid user data: missing both id and _id', storedUser);
          setError("Invalid user data. Please try logging in again.");
          navigate('/login');
          return;
        }

        const cleanUserData = {
          _id: userId,
          username: storedUser.username,
          email: storedUser.email,
          role: storedUser.role,
          tasks: storedUser.tasks || []
        };

        setUser(cleanUserData);
        setFormData({
          username: cleanUserData.username || '',
          email: cleanUserData.email || '',
          password: ""
        });

     
        if (cleanUserData.role === 'user') {
          await fetchTaskStats(userId);
        } else if (cleanUserData.role === 'admin') {
          await fetchAllUsers();
        } else if (cleanUserData.role === 'manager') {
          await fetchTeamMembers(userId);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error setting up user data:", err);
        setError("Error loading user data. Please try again.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleEditClick = () => setEditMode(true);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (!user) return;

    try {

      const userId = user._id;
      if (!userId) {
        console.error('User ID is missing:', user);
        setError("User ID is missing. Please try logging in again.");
        return;
      }

      const updateData = {
        username: formData.username,
        email: formData.email
      };

      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      const response = await axiosInstance.put(`/users/${userId}`, updateData);

      const updatedUser = response.data.user;
      if (!updatedUser) {
        throw new Error('No user data in response');
      }

      const cleanUserData = {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        tasks: updatedUser.tasks || []
      };


      setUser(cleanUserData);
      setEditMode(false);
      localStorage.setItem('user', JSON.stringify(cleanUserData));

      setFormData(prev => ({ ...prev, password: '' }));
      setError(null);
    } catch (err) {
      console.error("Error updating user:", err);
      if (err.response?.status === 404) {
        setError("User not found. Please try logging in again.");
      } else {
        setError(err.response?.data?.message || "Failed to update user data. Please try again.");
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const renderRoleSpecificContent = () => {
    if (!user) return null;

    switch (user.role) {
      case 'user':
        return (
          <div className={`task-stats ${theme}`}>
            <h3>Task Statistics</h3>
            <p><strong>Total Completed Tasks:</strong> {taskStats.totalTasks}</p>
            <p><strong>Average Completion Time:</strong> {taskStats.avgCompletionTime} hours</p>
          </div>
        );

      case 'admin':
        return (
          <div className={`user-list ${theme}`}>
            <h3>All Users</h3>
            <div className="users-grid">
              {allUsers.map(user => (
                <div key={user._id} className="user-card">
                  <p><strong>Username:</strong> {user.username}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'manager':
        return (
          <div className={`team-members ${theme}`}>
            <h3>Team Members</h3>
            <div className="members-grid">
              {teamMembers.map(member => (
                <div key={member._id} className="member-card">
                  <p><strong>Username:</strong> {member.username}</p>
                  <p><strong>Email:</strong> {member.email}</p>
                  <p><strong>Role:</strong> {member.role}</p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) return (
    <div className={`home-container ${theme}`}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"} ${theme}`}>
        <Navbar handleLogout={handleLogout} isSidebarOpen={isSidebarOpen} />
        <Main />
        <div className="loading">Loading user data...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className={`home-container ${theme}`}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"} ${theme}`}>
        <Navbar handleLogout={handleLogout} isSidebarOpen={isSidebarOpen} />
        <Main />
        <div className="error">{error}</div>
      </div>
    </div>
  );

  if (!user) return (
    <div className={`home-container ${theme}`}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"} ${theme}`}>
        <Navbar handleLogout={handleLogout} isSidebarOpen={isSidebarOpen} />
        <Main />
        <div className="error">No user data found</div>
      </div>
    </div>
  );

  return (
    <div className={`home-container ${theme}`}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"} ${theme}`}>
        <Navbar handleLogout={handleLogout} isSidebarOpen={isSidebarOpen} />
        <Main />
        <div className="user-profile">
          <div className={`profile-info ${theme}`}>
            <img src={profileImg} alt="Profile" className="profile-img" />
            {editMode ? (
              <>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="New Password (optional)"
                  onChange={handleChange}
                />
                <button className="profile-btn-edit" onClick={handleSave}>Save</button>
                <button className="profile-btn-cancel" onClick={() => setEditMode(false)}>Cancel</button>
              </>
            ) : (
              <>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <button className="profile-btn-edit" onClick={handleEditClick}>Edit Profile</button>
              </>
            )}
          </div>
          {renderRoleSpecificContent()}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
