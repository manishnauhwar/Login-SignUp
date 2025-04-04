import React, { useState, useEffect, useContext, useRef } from "react";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../sidebar/Sidebar";
import { logout } from "../../utils/auth";
import "./Profile.css";
import profileImg from "../../assets/profile.png";
import Main from "../Title/Main";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../utils/ThemeContext";
import axiosInstance from "../../utils/axiosInstance";
import UserModal from "../Profile/UserModal";
import TeamMembersModal from "../Profile/TeamMembersModal";
import { FaEdit } from 'react-icons/fa';

const UserProfile = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ fullname: "", email: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskStats, setTaskStats] = useState({
    totalTasks: 0,
    avgCompletionTime: 0
  });
  const [allUsers, setAllUsers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [managerTeams, setManagerTeams] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [showTeamMembersModal, setShowTeamMembersModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  // Profile picture state
  const [showImgModal, setShowImgModal] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);

  // Get the base URL for the API
  const getApiBaseUrl = () => {
    // Get the base URL from the axios instance or construct it
    const baseURL = axiosInstance.defaults.baseURL || window.location.origin.replace('3000', '5000');
    return baseURL;
  };

  // Function to get the full profile picture URL
  const getProfilePictureUrl = (relativePath) => {
    if (!relativePath) return profileImg;

    // If it's a data URL (from preview), return as is
    if (relativePath.startsWith('data:')) return relativePath;

    // If it's already an absolute URL, return as is
    if (relativePath.startsWith('http')) return relativePath;

    // Otherwise, prepend the API base URL
    return getApiBaseUrl() + relativePath;
  };

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

      const managerTeams = teams.filter(team =>
        team.manager._id === managerId || team.manager.id === managerId
      );

      if (managerTeams.length > 0) {
        const allMembers = [];
        const memberIds = new Set();

        managerTeams.forEach(team => {
          team.members.forEach(member => {
            if (!memberIds.has(member._id)) {
              memberIds.add(member._id);
              allMembers.push(member);
            }
          });
        });

        setTeamMembers(allMembers);
        setManagerTeams(managerTeams);
      } else {
        setTeamMembers([]);
        setManagerTeams([]);
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
          id: userId,
          fullname: storedUser.fullname,
          email: storedUser.email,
          role: storedUser.role,
          tasks: storedUser.tasks || [],
          profilePicture: storedUser.profilePicture || null
        };

        // Set profile picture preview if it exists
        if (cleanUserData.profilePicture) {
          setPreviewUrl(getProfilePictureUrl(cleanUserData.profilePicture));
        }

        setUser(cleanUserData);
        setFormData({
          fullname: cleanUserData.fullname || '',
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
  }, [navigate, lastRefresh]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'teamCreated' || e.key === 'teamUpdated' || e.key === 'teamDeleted') {
        setLastRefresh(Date.now());
      }
    };

    window.addEventListener('storage', handleStorageChange);

    window.dispatchEvent(new StorageEvent('storage', {
      key: 'profileRefresh',
      newValue: Date.now().toString()
    }));

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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
        fullname: formData.fullname,
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

      try {
        const completeUserResponse = await axiosInstance.get(`/users/${userId}`);
        if (completeUserResponse.data && completeUserResponse.data.user) {
          const completeUser = completeUserResponse.data.user;

          const enhancedUserData = {
            ...completeUser,
            _id: completeUser._id || completeUser.id,
            id: completeUser._id || completeUser.id,
            role: completeUser.role || updatedUser.role,
            tasks: completeUser.tasks || updatedUser.tasks || [],
            profilePicture: completeUser.profilePicture || updatedUser.profilePicture
          };

          localStorage.setItem('user', JSON.stringify(enhancedUserData));

          setUser(enhancedUserData);
          setEditMode(false);
          setFormData(prev => ({ ...prev, password: '' }));
          setError(null);

          window.location.reload();
          return;
        }
      } catch (fetchError) {
        console.error("Error fetching complete user data:", fetchError);
      }

      const cleanUserData = {
        _id: updatedUser._id,
        id: updatedUser._id,
        fullname: updatedUser.fullname,
        email: updatedUser.email,
        role: updatedUser.role,
        tasks: updatedUser.tasks || [],
        profilePicture: updatedUser.profilePicture
      };

      setUser(cleanUserData);
      setEditMode(false);
      localStorage.setItem('user', JSON.stringify(cleanUserData));

      setFormData(prev => ({ ...prev, password: '' }));
      setError(null);

      window.location.reload();

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

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axiosInstance.delete(`/users/${userId}`);
        fetchAllUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user. Please try again.");
      }
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleUserSaved = (savedUser) => {
    const userData = savedUser.user || savedUser;

    if (userData && userData._id) {
      setAllUsers(prevUsers => {
        const existing = prevUsers.find(u => u._id === userData._id);
        if (existing) {
          return prevUsers.map(u => u._id === userData._id ? userData : u);
        } else {
          return [...prevUsers, userData];
        }
      });
    } else {
      fetchAllUsers();
    }
    setLastRefresh(Date.now());
  };

  const handleViewTeamMembers = (team) => {
    setSelectedTeam(team);
    setShowTeamMembersModal(true);
  };

  const handleTeamUpdated = (updatedTeam) => {
    setManagerTeams(prevTeams =>
      prevTeams.map(team => team._id === updatedTeam._id ? updatedTeam : team)
    );

    localStorage.setItem('teamUpdated', Date.now().toString());

    window.dispatchEvent(new StorageEvent('storage', {
      key: 'teamUpdated',
      newValue: Date.now().toString()
    }));
  };

  // Profile picture functions
  const handleEditProfilePicture = () => {
    setShowImgModal(true);
  };

  const handleProfilePictureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSaveProfilePicture = async () => {
    if (!profilePicture || !user) return;

    try {
      const formData = new FormData();
      formData.append('profilePicture', profilePicture);

      const response = await axiosInstance.post(`/users/${user._id}/profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.profilePictureUrl) {
        // Update user in local storage with new profile picture URL
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          storedUser.profilePicture = response.data.profilePictureUrl;
          localStorage.setItem('user', JSON.stringify(storedUser));

          // Update user state
          setUser({
            ...user,
            profilePicture: response.data.profilePictureUrl
          });

          // Update preview URL with the full URL
          setPreviewUrl(getProfilePictureUrl(response.data.profilePictureUrl));
        }

        setShowImgModal(false);
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Failed to upload profile picture. Please try again.");
    }
  };

  const handleCancelProfilePicture = () => {
    setShowImgModal(false);
    setProfilePicture(null);
    // Reset preview to current user profile picture if it exists
    setPreviewUrl(user?.profilePicture ? getProfilePictureUrl(user.profilePicture) : "");
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
          <div className={`profile-user-list ${theme}`}>
            <div className="admin-table-header">
              <h3>All Users</h3>
              <button className="add-user-btn" onClick={handleAddUser}>
                <i className="fas fa-plus"></i> Add User
              </button>
            </div>
            <div className="profile-users-table-container">
              <table className="profile-users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(user => (
                    <tr key={user._id} className="profile-user-row">
                      <td>{user.fullname}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`user-role-badge role-${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="profile-user-actions">
                        <button
                          className="profile-edit-btn"
                          onClick={() => handleEditUser(user)}
                          title="Edit User"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="profile-delete-btn"
                          onClick={() => handleDeleteUser(user._id)}
                          title="Delete User"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'manager':
        return (
          <div className={`profile-teams-list ${theme}`}>
            <h3>My Teams</h3>
            {managerTeams.length > 0 ? (
              <div className="profile-teams-table-container">
                <table className="profile-teams-table">
                  <thead>
                    <tr>
                      <th>Team Name</th>
                      <th>Members</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managerTeams.map(team => (
                      <tr key={team._id} className="profile-team-row">
                        <td>{team.name}</td>
                        <td><span className="member-count">{team.members.length} members</span></td>
                        <td>
                          <button
                            className="manage-members-btn"
                            onClick={() => handleViewTeamMembers(team)}
                            title="Manage Team Members"
                          >
                            <i className="fas fa-users"></i> Manage Members
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-teams-message">You are not managing any teams yet.</p>
            )}
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
        {user.role === 'admin' ? (
          <div className="admin-profile-content">
            <div className={`profile-info ${theme}`}>
              <div className="profile-img-container">
                <img
                  src={getProfilePictureUrl(user.profilePicture)}
                  alt="Profile"
                  className="profile-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = profileImg;
                  }}
                />
                <div className="profile-img-edit" onClick={handleEditProfilePicture} title="Change profile picture">
                  <FaEdit />
                </div>
              </div>
              {editMode ? (
                <>
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    placeholder="fullname"
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
                  <p><strong>Name:</strong> {user.fullname}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                  <button className="profile-btn-edit" onClick={handleEditClick}>Edit Profile</button>
                </>
              )}
            </div>
            {renderRoleSpecificContent()}
          </div>
        ) : (
          <div className="user-profile">
            <div className={`profile-info ${theme}`}>
              <div className="profile-img-container">
                <img
                  src={getProfilePictureUrl(user.profilePicture)}
                  alt="Profile"
                  className="profile-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = profileImg;
                  }}
                />
                <div className="profile-img-edit" onClick={handleEditProfilePicture} title="Change profile picture">
                  <FaEdit />
                </div>
              </div>
              {editMode ? (
                <>
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    placeholder="fullname"
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
                  <p><strong>Name:</strong> {user.fullname}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                  <button className="profile-btn-edit" onClick={handleEditClick}>Edit Profile</button>
                </>
              )}
            </div>
            {renderRoleSpecificContent()}
          </div>
        )}
      </div>

      {/* Profile Picture Upload Modal */}
      {showImgModal && (
        <div className="profile-img-modal">
          <div className="profile-img-modal-content">
            <h3>Update Profile Picture</h3>

            <img
              src={previewUrl || profileImg}
              alt="Profile Preview"
              className="profile-img-preview"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = profileImg;
              }}
            />

            <input
              type="file"
              ref={fileInputRef}
              className="profile-img-input"
              accept="image/*"
              onChange={handleProfilePictureChange}
            />

            <button
              className="profile-img-upload-btn"
              onClick={triggerFileInput}
            >
              Choose Image
            </button>

            <div className="profile-img-modal-actions">
              <button
                className="profile-img-save-btn"
                onClick={handleSaveProfilePicture}
                disabled={!profilePicture}
              >
                Save
              </button>
              <button
                className="profile-img-cancel-btn"
                onClick={handleCancelProfilePicture}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <UserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onUserSaved={handleUserSaved}
        user={selectedUser}
      />

      <TeamMembersModal
        isOpen={showTeamMembersModal}
        onClose={() => setShowTeamMembersModal(false)}
        team={selectedTeam}
        onTeamUpdated={handleTeamUpdated}
      />
    </div>
  );
};

export default UserProfile;
