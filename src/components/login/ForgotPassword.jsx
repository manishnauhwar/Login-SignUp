import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import img from "../../assets/img.webp";
import axiosInstance from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && !canResend) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axiosInstance.get(`/users/check-email/${email}`);
      if (response.data.exists) {
        setMessage(t("resetLinkSent"));
        setTimer(30);
        setCanResend(false);
      } else {
        setError(t("emailNotFound"));
      }
    } catch (error) {
      setError(error.response?.data?.message || t("errorOccurred"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendLink = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axiosInstance.get(`/users/check-email/${email}`);
      if (response.data.exists) {
        setMessage(t("resetLinkSent"));
        setTimer(30);
        setCanResend(false);
      } else {
        setError(t("emailNotFound"));
      }
    } catch (error) {
      setError(error.response?.data?.message || t("errorOccurred"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={img} alt="Background" className="login-img" />
        <div className="overlay-text">
          <h1>{t("resetPassword")}</h1>
          <p>{t("enterEmailToReset")}</p>
        </div>
      </div>

      <div className="login-right">
        <h2>{t("resetPassword")}</h2>
        <p>
          {t("rememberPassword")}{" "}
          <Link to="/login" className="link">
            {t("login")}
          </Link>
        </p>

        <form onSubmit={handleEmailSubmit}>
          <input
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            required
          />

          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}

          {!message ? (
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? t("sending") : t("sendResetLink")}
            </button>
          ) : (
            <div className="resend-container">
              <button
                type="button"
                className="btn-primary"
                onClick={handleResendLink}
                disabled={!canResend || isLoading}
              >
                {isLoading ? t("sending") : t("sendResetLink")}
              </button>
              {!canResend && (
                <span className="timer">
                  {t("resendIn")} {timer}s
                </span>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
