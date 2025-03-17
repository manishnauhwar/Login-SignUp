import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import img from "../assets/img.webp";
import GoogleAuth from "./GoogleAuth";
import "./GoogleAuth.css";
import FacebookAuth from "./FacebookAuth";
import "./FacebookAuth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      setEmailError("Enter a valid email.");
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/users");
      const users = await response.json();

      const user = users.find((user) => user.email === email && user.password === password);

      if (user) {
        localStorage.setItem("authToken", email);
        navigate("/dashboard");
      } else {
        setEmailError("Invalid email or password.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setEmailError("An error occurred. Please try again.");
    }
  };

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

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError(validateEmail(e.target.value) ? "" : "Invalid email format");
          }}
          className={`input ${emailError ? "input-error" : ""}`}
        />
        {emailError && <p className="error-text">{emailError}</p>}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError(validatePassword(e.target.value) ? "" : "Password must be at least 6 characters");
          }}
          className={`input ${passwordError ? "input-error" : ""}`}
        />
        {passwordError && <p className="error-text">{passwordError}</p>}
        <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>

        <button onClick={handleLogin} className="btn-primary" disabled={!validateEmail(email) || !validatePassword(password)}>
          Login
        </button>

        <div className="social-login-container">
          <GoogleAuth  />
          <FacebookAuth />
        </div>
      </div>
    </div>
  );
};

export default Login;
