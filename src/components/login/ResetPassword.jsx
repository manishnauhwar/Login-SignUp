import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import img from "../../assets/img.webp";

const ResetPassword = () => {
  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axiosInstance.get(`/users/verify-reset-token/${token}`);
        if (response.data.success) {
          setIsTokenValid(true);
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        setError(error.response?.data?.message || t("errorOccurred"));
      }
    };

    verifyToken();
  }, [token, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError(t("passwordMinLength"));
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post(`/users/reset-password/${token}`, {
        newPassword
      });
      setMessage(response.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || t("errorOccurred"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isTokenValid) {
    return (
      <div className="login-container">
        <div className="login-left">
          <img src={img} alt="Background" className="login-img" />
          <div className="overlay-text">
            <h1>{t("resetPassword")}</h1>
            <p>{t("invalidResetLink")}</p>
          </div>
        </div>
        <div className="login-right">
          <h2>{t("invalidResetLink")}</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={img} alt="Background" className="login-img" />
        <div className="overlay-text">
          <h1>{t("resetPassword")}</h1>
          <p>{t("enterNewPassword")}</p>
        </div>
      </div>

      <div className="login-right">
        <h2>{t("resetPassword")}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder={t("newPassword")}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input"
            required
          />

          <input
            type="password"
            placeholder={t("confirmNewPassword")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input"
            required
          />

          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? t("resetting") : t("resetPassword")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 