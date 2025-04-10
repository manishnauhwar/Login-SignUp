import { useState, useEffect } from "react";
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
  const [formValid, setFormValid] = useState(false);

  const [formState, setFormState] = useState({
    email: "",
    password: "",
    errors: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const checkForAutofill = () => {
      const emailInput = document.querySelector('input[name="email"]');
      const passwordInput = document.querySelector('input[name="password"]');

      if (emailInput && passwordInput) {
        if (emailInput.value && passwordInput.value) {
          setFormState(prev => ({
            ...prev,
            email: emailInput.value,
            password: passwordInput.value
          }));
          setFormValid(true);
        }
      }
    };

    checkForAutofill();
    const timeoutId = setTimeout(checkForAutofill, 500);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const isValid = formState.email.trim() !== "" && formState.password.trim() !== "";
    setFormValid(isValid);
  }, [formState.email, formState.password]);

  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (authError) setAuthError("");

    setFormState(prev => ({
      ...prev,
      [name]: value,
      errors: {
        ...prev.errors,
        [name]: ""
      }
    }));
  };

  const handleInputFocus = () => {
    if (authError) {
      setAuthError("");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError("");

    const emailValid = validateEmail(formState.email);
    const passwordValid = validatePassword(formState.password);

    if (!emailValid || !passwordValid) {
      setIsLoading(false);
      setAuthError(t("invalidCredentials"));
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
          <input
            type="email"
            name="email"
            placeholder={t("email")}
            value={formState.email}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            className="input"
          />

          <input
            type="password"
            name="password"
            placeholder={t("password")}
            value={formState.password}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            className={`input ${authError ? "input-error" : ""}`}
          />
          {authError && <p className="error-text">{authError}</p>}

          <Link to="/forgot-password" className="forgot-password">{t("forgotPassword")}</Link>

          <button
            type="submit"
            className="btn-primary"
            disabled={!formValid || isLoading}
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
