import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import img from "../../assets/img.webp";
import GoogleAuth from "./GoogleAuth";
import "./GoogleAuth.css";
import FacebookAuth from "./FacebookAuth";
import "./FacebookAuth.css";
import axiosInstance from "../../utils/axiosInstance";

const Signup = () => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    errors: {
      username: "",
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

  const validateUsername = (username) => {
    return username.length >= 3;
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
          : name === 'username'
            ? (validateUsername(value) ? "" : "Username must be at least 3 characters")
            : name === 'password'
              ? (validatePassword(value) ? "" : "Password must be at least 6 characters")
              : name === 'confirmPassword'
                ? (value === formState.password ? "" : "Passwords do not match")
                : ""
      }
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // Validate all fields
    const usernameValid = validateUsername(formState.username);
    const emailValid = validateEmail(formState.email);
    const passwordValid = validatePassword(formState.password);
    const passwordsMatch = formState.password === formState.confirmPassword;

    if (!usernameValid || !emailValid || !passwordValid || !passwordsMatch) {
      setFormState(prev => ({
        ...prev,
        errors: {
          username: usernameValid ? "" : "Username must be at least 3 characters",
          email: emailValid ? "" : "Enter a valid email",
          password: passwordValid ? "" : "Password must be at least 6 characters",
          confirmPassword: passwordsMatch ? "" : "Passwords do not match"
        }
      }));
      return;
    }

    try {
      console.log('Attempting signup with:', {
        username: formState.username,
        email: formState.email,
        password: formState.password
      });

      const response = await axiosInstance.post("/users/signup", {
        username: formState.username,
        email: formState.email,
        password: formState.password
      });

      console.log('Signup response:', response.data);

      if (response.data.message === 'User created successfully') {
        // After successful signup, automatically log in
        const loginResponse = await axiosInstance.post("/users/login", {
          email: formState.email,
          password: formState.password
        });

        if (loginResponse.data) {
          localStorage.setItem("user", JSON.stringify(loginResponse.data.user));
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Error during signup:", error);

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

  const isFormValid = validateUsername(formState.username) &&
    validateEmail(formState.email) &&
    validatePassword(formState.password) &&
    formState.password === formState.confirmPassword;

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={img} alt="Background" className="login-img" />
        <div className="overlay-text">
          <h1>Create Account</h1>
          <p>Join us today!</p>
        </div>
      </div>

      <div className="login-right">
        <h2>Sign Up</h2>
        <p>
          Already have an account?{" "}
          <Link to="/login" className="link">
            Login
          </Link>
        </p>

        <form onSubmit={handleSignup}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formState.username}
            onChange={handleInputChange}
            className={`input ${formState.errors.username ? "input-error" : ""}`}
          />
          {formState.errors.username && <p className="error-text">{formState.errors.username}</p>}

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

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
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
            Sign Up
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

export default Signup;
