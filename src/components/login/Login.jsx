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

  const [formState, setFormState] = useState({
    email: "",
    password: "",
    errors: {
      email: "",
      password: "",
    },
  });

  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value,
      errors: {
        ...prev.errors,
        [name]: name === 'email'
          ? (validateEmail(value) ? "" : t("invalidEmailFormat"))
          : (validatePassword(value) ? "" : t("passwordMinLength"))
      }
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validate all fields
    const emailValid = validateEmail(formState.email);
    const passwordValid = validatePassword(formState.password);

    if (!emailValid || !passwordValid) {
      setFormState(prev => ({
        ...prev,
        errors: {
          email: emailValid ? "" : t("invalidEmailFormat"),
          password: passwordValid ? "" : t("passwordMinLength")
        }
      }));
      return;
    }

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

      let errorMessage = t("errorOccurred");

      if (error.code === 'ERR_NETWORK') {
        errorMessage = "Unable to connect to server. Please check your internet connection.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setFormState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          email: errorMessage
        }
      }));
    }
  };

  const isFormValid = validateEmail(formState.email) && validatePassword(formState.password);

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
          <input
            type="email"
            name="email"
            placeholder={t("email")}
            value={formState.email}
            onChange={handleInputChange}
            className={`input ${formState.errors.email ? "input-error" : ""}`}
          />
          {formState.errors.email && <p className="error-text">{formState.errors.email}</p>}

          <input
            type="password"
            name="password"
            placeholder={t("password")}
            value={formState.password}
            onChange={handleInputChange}
            className={`input ${formState.errors.password ? "input-error" : ""}`}
          />
          {formState.errors.password && <p className="error-text">{formState.errors.password}</p>}

          <Link to="/forgot-password" className="forgot-password">{t("forgotPassword")}</Link>

          <button
            type="submit"
            className="btn-primary"
            disabled={!isFormValid}
          >
            {t("login")}
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
