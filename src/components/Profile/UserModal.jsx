import React, { useState, useEffect, useContext } from "react";
import Modal from "react-modal";
import { ThemeContext } from "../../utils/ThemeContext";
import axiosInstance from "../../utils/axiosInstance";
import "./UserModal.css";

const UserModal = ({ isOpen, onClose, onUserSaved, user }) => {
  const { theme } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "user"
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!user;

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        fullname: user.fullname || "",
        email: user.email || "",
        password: "",
        role: user.role || "user"
      });
    } else if (isOpen) {
      setFormData({
        fullname: "",
        email: "",
        password: "",
        role: "user"
      });
    }
    setError("");
  }, [isOpen, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.fullname.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!isEditMode && !formData.password.trim()) {
      setError("Password is required for new users");
      return false;
    }
    if (!isEditMode && formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let response;

      if (isEditMode) {
        const updateData = {
          fullname: formData.fullname,
          email: formData.email,
          role: formData.role
        };

        if (formData.password.trim()) {
          updateData.password = formData.password;
        }

        response = await axiosInstance.put(`/users/${user._id}`, updateData);
      } else {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        const user = localStorage.getItem('user');
        const isAdminCreatingUser = token && user;

        if (isAdminCreatingUser) {
          console.log('Admin creating user with token:', token.substring(0, 15) + '...');
          response = await axiosInstance.post('/users/admin/create-user', formData);
        } else {
          console.log('Regular signup without admin privileges');
          response = await axiosInstance.post('/users/signup', {
            fullname: formData.fullname,
            email: formData.email,
            password: formData.password
          });
        }
      }

      if (response.status === 200 || response.status === 201) {

        const userData = response.data.user || response.data;
        onUserSaved(userData);
        onClose();
      }
    } catch (error) {
      console.error("Error saving user:", error);
      setError(error.response?.data?.message || "Failed to save user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={isEditMode ? "Edit User" : "Add User"}
      className="user-modal-content"
      overlayClassName="user-modal-overlay"
      ariaHideApp={false}
      data-theme={theme}
    >
      <div className="user-modal-header">
        <h2>{isEditMode ? "Edit User" : "Add New User"}</h2>
        <button className="user-modal-close" onClick={onClose}>×</button>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="user-modal-error">{error}</div>}

        <div className="user-modal-field">
          <label htmlFor="fullname">Full Name</label>
          <input
            id="fullname"
            name="fullname"
            type="text"
            value={formData.fullname}
            onChange={handleChange}
            placeholder="Enter full name"
          />
        </div>

        <div className="user-modal-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
          />
        </div>

        <div className="user-modal-field">
          <label htmlFor="password">{isEditMode ? "New Password (leave blank to keep current)" : "Password"}</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={isEditMode ? "Enter new password (optional)" : "Enter password"}
          />
        </div>

        <div className="user-modal-field">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="user">User</option>
            <option value="manager">Manager</option>
          </select>
        </div>

        <div className="user-modal-actions">
          <button
            type="button"
            onClick={onClose}
            className="user-modal-cancel"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="user-modal-submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? (isEditMode ? "Updating..." : "Creating...")
              : (isEditMode ? "Update User" : "Create User")}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserModal; 