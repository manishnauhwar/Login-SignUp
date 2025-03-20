import React, { useState, useEffect, useContext } from "react";
import { logout } from "../../utils/auth";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import Main from "../Title/Main";
import "./User.css";
import { ThemeContext } from "../../utils/ThemeContext";

const User = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [teams, setTeams] = useState([]);
  const [user, setUser] = useState(null);
  const [userTeam, setUserTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("http://localhost:5000/teams");
        const data = await res.json();
        if (data && Array.isArray(data)) {
          setTeams(data);
          const loggedInUserId = "U6";
          const foundTeam = data.find(team => team.members.some(member => member.id === loggedInUserId));
          if (foundTeam) {
            const foundUser = foundTeam.members.find(member => member.id === loggedInUserId);
            setUser(foundUser);
            setUserTeam(foundTeam);
          }
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      try {
        const res = await fetch("http://localhost:5000/tasks");
        const data = await res.json();
        if (data && Array.isArray(data)) {
          const userTasks = data.filter(task => task.assignedTo === user.id);
          setTasks(userTasks);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="home-container" data-theme={theme}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`} data-theme={theme}>
        <Navbar handleLogout={handleLogout} isSidebarOpen={isSidebarOpen} />
        <Main />
        <div className="cards-container">
          {user && (
            <div className="user-card">
              <h2>User Details</h2>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
            </div>
          )}
          {userTeam && (
            <div className="team-card">
              <h2>Team Details</h2>
              <p><strong>Team Name:</strong> {userTeam.name}</p>
              <p><strong>Manager:</strong> {userTeam.manager.name}</p>
            </div>
          )}
          <div className="tasks-card">
            <h2>Tasks To Do</h2>
            {tasks.length > 0 ? (
              <ul>
                {tasks.map(task => (
                  <li key={task.id}>
                    <strong>Title:</strong> {task.title} <br />
                    <strong>Priority:</strong> {task.priority} <br />
                    <strong>Due Date:</strong> {task.dueDate}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No tasks assigned.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;
