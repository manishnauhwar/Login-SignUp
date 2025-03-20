import React, { useState, useEffect, useContext } from "react";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../sidebar/Sidebar";
import { logout } from "../../utils/auth";
import "./Profile.css";
import profileImg from "../../assets/profile.png";
import Main from "../Title/Main";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../utils/ThemeContext";

const UserProfile = () => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("authToken");
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [taskStats, setTaskStats] = useState({ totalTasks: 0, avgCompletionTime: 0 });
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    fetch(`http://localhost:5000/users?email=${userEmail}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length) {
          setUser(data[0]);
          setFormData({ name: data[0].name, email: data[0].email, password: "" });

          fetch(`http://localhost:5000/tasks?assignedTo=${data[0].id}&status=Completed`)
            .then((res) => res.json())
            .then((tasks) => {
              const totalTasks = tasks.length;
              const totalMinutes = tasks.reduce((acc, task) => {
                const [hours, minutes] = task.completionTime.split(":").map(Number);
                return acc + hours * 60 + minutes;
              }, 0);
              const avgCompletionTime = totalTasks ? (totalMinutes / totalTasks / 60).toFixed(2) : "0";
              setTaskStats({ totalTasks, avgCompletionTime });
            });
        }
      });
  }, [userEmail]);

  const handleEditClick = () => setEditMode(true);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = () => {
    if (!user) return;

    const updatedUser = { ...user, name: formData.name, email: formData.email };
    if (formData.password) updatedUser.password = formData.password;

    fetch(`http://localhost:5000/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    })
      .then((res) => res.json())
      .then(() => {
        setUser(updatedUser);
        setEditMode(false);
      });
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  if (!user) return <p>Loading user data...</p>;

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
                <input type="text" name="name" value={formData.name} onChange={handleChange} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} />
                <input type="password" name="password" placeholder="New Password" onChange={handleChange} />
                <button className="profile-btn-edit" onClick={handleSave}>Save</button>
              </>
            ) : (
              <>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <button className="profile-btn-edit"onClick={handleEditClick}>Edit Profile</button>
              </>
            )}
          </div>
          <div className={`task-stats ${theme}`}>
            <h3>Task Statistics</h3>
            <p><strong>Total Completed Tasks:</strong> {taskStats.totalTasks}</p>
            <p><strong>Average Completion Time:</strong> {taskStats.avgCompletionTime} hrs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
