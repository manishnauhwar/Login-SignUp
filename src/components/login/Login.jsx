import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import img from "../../assets/img.webp";
import GoogleAuth from "../login/GoogleAuth";
import "./GoogleAuth.css";
import axiosInstance from "../../utils/axiosInstance";
import { setAuthData } from "../../utils/auth";
import { useTranslation } from "react-i18next";

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: ""
  });

  const [formState, setFormState] = useState({
    email: "",
    password: "",
  });

  const validateEmail = (email) => {
    if (!email.trim()) {
      return { valid: false, error: "Email is required" };
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return {
      valid: emailPattern.test(email),
      error: emailPattern.test(email) ? "" : "Please enter a valid email address"
    };
  };

  const validatePassword = (password) => {
    if (!password.trim()) {
      return { valid: false, error: "Password is required" };
    }
    return {
      valid: password.length >= 6,
      error: password.length >= 6 ? "" : "Password must be at least 6 characters long"
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (authError) setAuthError("");
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }

    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputFocus = () => {
    if (authError) {
      setAuthError("");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const emailValidation = validateEmail(formState.email);
    const passwordValidation = validatePassword(formState.password);

    setValidationErrors({
      email: emailValidation.error,
      password: passwordValidation.error
    });

    if (!emailValidation.valid || !passwordValidation.valid) {
      return;
    }

    setIsLoading(true);
    setAuthError("");

    try {
      const response = await axiosInstance.post("/users/login", {
        email: formState.email,
        password: formState.password
      });

      if (response.data && response.data.user && response.data.token) {
        setAuthData(response.data.token, response.data.user);
        navigate("/dashboard", { replace: true });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error during login:", error);

      if (error.code === 'ERR_NETWORK') {
        setAuthError(t("unableToConnect", "Unable to connect to server. Please check your internet connection."));
      } else {
        setAuthError(t("invalidCredentials"));
      }

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={img} alt="Background" className="login-img" />
        <div className="overlay-text">
          <h1>{t("welcomeBack")}</h1>
          <p>{t("logInToContinue")}</p>
        </div>
      </div>

      <div className="login-right">
        <h2>{t("login")}</h2>
        <p>
          {t("dontHaveAccount")}{" "}
          <Link to="/Signup" className="link">
            {t("signup")}
          </Link>
        </p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder={t("email")}
              value={formState.email}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              className={`input ${validationErrors.email ? "input-error" : ""}`}
            />
            {validationErrors.email && <p className="error-text">{validationErrors.email}</p>}
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder={t("password")}
              value={formState.password}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              className={`input ${validationErrors.password ? "input-error" : ""}`}
            />
            {validationErrors.password && <p className="error-text">{validationErrors.password}</p>}
          </div>

          {authError && <p className="auth-error">{authError}</p>}

          <Link to="/forgot-password" className="forgot-password">{t("forgotPassword")}</Link>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? t("loggingIn") : t("login")}
          </button>
        </form>

        <div className="or-separator">
          <span>{t("or")}</span>
        </div>

        <div className="social-login-container">
          <GoogleAuth />
        </div>
      </div>
    </div>
  );
};

export default Login;
