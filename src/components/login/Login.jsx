import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import img from "../../assets/img.webp";
import GoogleAuth from "../login/GoogleAuth";
import "./GoogleAuth.css";
import FacebookAuth from "../login/FacebookAuth";
import "./FacebookAuth.css";
import axiosInstance from "../../utils/axiosInstance";
import { setAuthData } from "../../utils/auth";

const Login = () => {
  const navigate = useNavigate();
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
          ? (validateEmail(value) ? "" : "Invalid email format")
          : (validatePassword(value) ? "" : "Password must be at least 6 characters")
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
          email: emailValid ? "" : "Enter a valid email",
          password: passwordValid ? "" : "Password must be at least 6 characters"
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

      let errorMessage = "An error occurred. Please try again.";

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
          <h1>Welcome Back</h1>
          <p>Log in to continue.</p>
        </div>
      </div>

      <div className="login-right">
        <h2>Login</h2>
        <p>
          Don't have an account?{" "}
          <Link to="/Signup" className="link">
            Signup
          </Link>
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formState.email}
            onChange={handleInputChange}
            className={`input ${formState.errors.email ? "input-error" : ""}`}
          />
          {formState.errors.email && <p className="error-text">{formState.errors.email}</p>}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formState.password}
            onChange={handleInputChange}
            className={`input ${formState.errors.password ? "input-error" : ""}`}
          />
          {formState.errors.password && <p className="error-text">{formState.errors.password}</p>}

          <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>

          <button
            type="submit"
            className="btn-primary"
            disabled={!isFormValid}
          >
            Login
          </button>
        </form>

        <div className="social-login-container">
          <GoogleAuth />
          <FacebookAuth />
        </div>
      </div>
    </div>
  );
};

export default Login;
