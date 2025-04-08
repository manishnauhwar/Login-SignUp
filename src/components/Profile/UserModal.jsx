import React, { useState, useEffect, useContext } from "react";
import Modal from "react-modal";
import { ThemeContext } from "../../utils/ThemeContext";
import axiosInstance from "../../utils/axiosInstance";
import "./UserModal.css";
import { useTranslation } from "react-i18next";

const UserModal = ({ isOpen, onClose, onUserSaved, user }) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
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
      setError(t("nameIsRequired"));
      return false;
    }
    if (!formData.email.trim()) {
      setError(t("emailIsRequired"));
      return false;
    }
    if (!isEditMode && !formData.password.trim()) {
      setError(t("passwordIsRequired"));
      return false;
    }
    if (!isEditMode && formData.password.length < 6) {
      setError(t("passwordMinLength"));
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
          response = await axiosInstance.post('/users/admin/create-user', formData);
        } else {
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
      setError(error.response?.data?.message || t("failedToSaveUser"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={isEditMode ? t("editUser") : t("addNewUser")}
      className="user-modal-content"
      overlayClassName="user-modal-overlay"
      ariaHideApp={false}
      data-theme={theme}
    >
      <div className="user-modal-header">
        <h2>{isEditMode ? t("editUser") : t("addNewUser")}</h2>
        <button className="user-modal-close" onClick={onClose}>×</button>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="user-modal-error">{error}</div>}

        <div className="user-modal-field">
          <label htmlFor="fullname">{t("fullName")}</label>
          <input
            id="fullname"
            name="fullname"
            type="text"
            value={formData.fullname}
            onChange={handleChange}
            placeholder={t("enterFullName")}
          />
        </div>

        <div className="user-modal-field">
          <label htmlFor="email">{t("email")}</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t("enterEmail")}
          />
        </div>

        <div className="user-modal-field">
          <label htmlFor="password">{isEditMode ? t("newPasswordOptional") : t("password")}</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={isEditMode ? t("enterNewPassword") : t("enterPassword")}
          />
        </div>

        <div className="user-modal-field">
          <label htmlFor="role">{t("role")}</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="user">{t("user")}</option>
            <option value="manager">{t("manager")}</option>
          </select>
        </div>

        <div className="user-modal-actions">
          <button
            type="button"
            onClick={onClose}
            className="user-modal-cancel"
            disabled={isSubmitting}
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            className="user-modal-submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? (isEditMode ? t("updating") : t("creating"))
              : (isEditMode ? t("updateUser") : t("createUser"))}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserModal; 