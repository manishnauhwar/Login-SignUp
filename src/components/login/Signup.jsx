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
  const [isLoading, setIsLoading] = useState(false);

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
    touched: {
      fullname: false,
      email: false,
      password: false,
      confirmPassword: false,
    }
  });

  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validatefullname = (fullname) => {
    const startsWithAlphabets = /^[A-Za-z]{3,}[A-Za-z\s]*[A-Za-z]$/;
    const alphabetCount = fullname.replace(/[^A-Za-z]/g, '').length;
    return startsWithAlphabets.test(fullname) && alphabetCount <= 30;
  };

  const normalizeName = (name) => {
    return name.replace(/\s+/g, ' ').trim();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value,
      errors: {
        ...prev.errors,
        [name]: ""
      }
    }));
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;

    if (name === 'fullname' && value) {
      const normalizedName = normalizeName(value);
      if (normalizedName !== value) {
        setFormState(prev => ({
          ...prev,
          [name]: normalizedName
        }));
      }
    }

    let error = "";
    if (name === 'email' && value) {
      error = validateEmail(value) ? "" : t("invalidEmailFormat");
    } else if (name === 'fullname' && value) {
      const normalizedName = normalizeName(value);
      if (!/^[A-Za-z\s]+$/.test(normalizedName)) {
        error = t("fullnameAlphabetsOnly");
      } else if (!/^[A-Za-z]{3,}/.test(normalizedName)) {
        error = t("fullnameMinLength");
      } else if (normalizedName.replace(/[^A-Za-z]/g, '').length > 30) {
        error = t("fullnameMaxLength", "Fullname cannot exceed 30 alphabetic characters");
      } else if (/\s$/.test(normalizedName)) {
        error = t("fullnameNoTrailingSpace", "Fullname cannot end with a space");
      }
    } else if (name === 'password' && value) {
      error = validatePassword(value) ? "" : t("passwordMinLength");
    } else if (name === 'confirmPassword' && value) {
      error = (value === formState.password) ? "" : t("passwordsDoNotMatch");
    }

    setFormState(prev => ({
      ...prev,
      touched: {
        ...prev.touched,
        [name]: true
      },
      errors: {
        ...prev.errors,
        [name]: error
      }
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const normalizedFullname = normalizeName(formState.fullname);
    if (normalizedFullname !== formState.fullname) {
      setFormState(prev => ({
        ...prev,
        fullname: normalizedFullname
      }));
    }

    const fullnameValid = validatefullname(normalizedFullname);
    const emailValid = validateEmail(formState.email);
    const passwordValid = validatePassword(formState.password);
    const passwordsMatch = formState.password === formState.confirmPassword;

    if (!fullnameValid || !emailValid || !passwordValid || !passwordsMatch) {
      setFormState(prev => ({
        ...prev,
        touched: {
          fullname: true,
          email: true,
          password: true,
          confirmPassword: true
        },
        errors: {
          fullname: !fullnameValid
            ? (!(/^[A-Za-z\s]+$/.test(normalizedFullname))
              ? t("fullnameAlphabetsOnly")
              : !/^[A-Za-z]{3,}/.test(normalizedFullname)
                ? t("fullnameMinLength")
                : normalizedFullname.replace(/[^A-Za-z]/g, '').length > 30
                  ? t("fullnameMaxLength", "Fullname cannot exceed 30 alphabetic characters")
                  : /\s$/.test(normalizedFullname)
                    ? t("fullnameNoTrailingSpace", "Fullname cannot end with a space")
                    : t("fullnameMinLength"))
            : "",
          email: emailValid ? "" : t("invalidEmailFormat"),
          password: passwordValid ? "" : t("passwordMinLength"),
          confirmPassword: passwordsMatch ? "" : t("passwordsDoNotMatch")
        }
      }));
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post("/users/signup", {
        fullname: normalizedFullname,
        email: formState.email,
        password: formState.password
      });

      if (response.status === 200 || response.status === 201) {
        navigate("/login", {
          state: {
            message: "Account created successfully. Please log in to continue.",
            email: formState.email
          }
        });
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
          confirmPassword: errorMessage
        }
      }));
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
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
            onBlur={handleInputBlur}
            className={`input ${formState.touched.fullname && formState.errors.fullname ? "input-error" : ""}`}
          />
          {formState.touched.fullname && formState.errors.fullname && (
            <p className="error-text">{formState.errors.fullname}</p>
          )}

          <input
            type="email"
            name="email"
            placeholder={t("email")}
            value={formState.email}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`input ${formState.touched.email && formState.errors.email ? "input-error" : ""}`}
          />
          {formState.touched.email && formState.errors.email && (
            <p className="error-text">{formState.errors.email}</p>
          )}

          <input
            type="password"
            name="password"
            placeholder={t("password")}
            value={formState.password}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`input ${formState.touched.password && formState.errors.password ? "input-error" : ""}`}
          />
          {formState.touched.password && formState.errors.password && (
            <p className="error-text">{formState.errors.password}</p>
          )}

          <input
            type="password"
            name="confirmPassword"
            placeholder={t("confirmPassword")}
            value={formState.confirmPassword}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`input ${formState.touched.confirmPassword && formState.errors.confirmPassword ? "input-error" : ""}`}
          />
          {formState.touched.confirmPassword && formState.errors.confirmPassword && (
            <p className="error-text">{formState.errors.confirmPassword}</p>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? t("creatingAccount") : t("signUp")}
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
