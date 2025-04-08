import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import img from "../../assets/img.webp";
import GoogleAuth from "./GoogleAuth";
import "./GoogleAuth.css";
import axiosInstance from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";

const Signup = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formState, setFormState] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    errors: {
      fullname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validatefullname = (fullname) => {
    return fullname.length >= 3;
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
          : name === 'fullname'
            ? (validatefullname(value) ? "" : t("fullnameMinLength"))
            : name === 'password'
              ? (validatePassword(value) ? "" : t("passwordMinLength"))
              : name === 'confirmPassword'
                ? (value === formState.password ? "" : t("passwordsDoNotMatch"))
                : ""
      }
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const fullnameValid = validatefullname(formState.fullname);
    const emailValid = validateEmail(formState.email);
    const passwordValid = validatePassword(formState.password);
    const passwordsMatch = formState.password === formState.confirmPassword;

    if (!fullnameValid || !emailValid || !passwordValid || !passwordsMatch) {
      setFormState(prev => ({
        ...prev,
        errors: {
          fullname: fullnameValid ? "" : t("fullnameMinLength"),
          email: emailValid ? "" : t("invalidEmailFormat"),
          password: passwordValid ? "" : t("passwordMinLength"),
          confirmPassword: passwordsMatch ? "" : t("passwordsDoNotMatch")
        }
      }));
      return;
    }

    try {

      const response = await axiosInstance.post("/users/signup", {
        fullname: formState.fullname,
        email: formState.email,
        password: formState.password
      });


      if (response.status === 200 || response.status === 201) {
        try {
          const loginResponse = await axiosInstance.post("/users/login", {
            email: formState.email,
            password: formState.password
          });


          if (loginResponse.data && loginResponse.data.token) {
            localStorage.setItem("accessToken", loginResponse.data.token);
            localStorage.setItem("user", JSON.stringify(loginResponse.data.user));

            navigate("/login");
          } else {
            console.error("Missing token in login response");
            navigate("/login", {
              state: { message: "Account created. Please log in to continue." }
            });
          }
        } catch (loginError) {
          console.error("Login after signup failed:", loginError);
          navigate("/login", {
            state: { message: "Account created successfully. Please log in." }
          });
        }
      }
    } catch (error) {
      console.error("Error during signup:", error);

      let errorMessage = t("errorOccurred");

      if (error.code === 'ERR_NETWORK') {
        errorMessage = "Unable to connect to server. Please check if the backend server is running.";
      } else if (error.response?.status === 409 || error.response?.status === 400) {
        errorMessage = error.response?.data?.message || "This email or username is already in use.";
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

  const isFormValid = validatefullname(formState.fullname) &&
    validateEmail(formState.email) &&
    validatePassword(formState.password) &&
    formState.password === formState.confirmPassword;

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={img} alt="Background" className="login-img" />
        <div className="overlay-text">
          <h1>{t("createAccount")}</h1>
          <p>{t("joinUsToday")}</p>
        </div>
      </div>

      <div className="login-right">
        <h2>{t("signUp")}</h2>
        <p>
          {t("alreadyHaveAccount")}{" "}
          <Link to="/login" className="link">
            {t("login")}
          </Link>
        </p>

        <form onSubmit={handleSignup}>
          <input
            type="text"
            name="fullname"
            placeholder={t("fullname")}
            value={formState.fullname}
            onChange={handleInputChange}
            className={`input ${formState.errors.fullname ? "input-error" : ""}`}
          />
          {formState.errors.fullname && <p className="error-text">{formState.errors.fullname}</p>}

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

          <input
            type="password"
            name="confirmPassword"
            placeholder={t("confirmPassword")}
            value={formState.confirmPassword}
            onChange={handleInputChange}
            className={`input ${formState.errors.confirmPassword ? "input-error" : ""}`}
          />
          {formState.errors.confirmPassword && <p className="error-text">{formState.errors.confirmPassword}</p>}

          <button
            type="submit"
            className="btn-primary"
            disabled={!isFormValid}
          >
            {t("signUp")}
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

export default Signup;
