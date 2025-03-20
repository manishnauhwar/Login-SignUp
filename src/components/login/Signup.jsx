import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import img from "../../assets/img.webp";
import GoogleAuth from "./GoogleAuth";
import "./GoogleAuth.css";
import FacebookAuth from "./FacebookAuth";
import "./FacebookAuth.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const handleSignup = async () => {
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/users");
      const users = await response.json();
  
      const userExists = users.find((user) => user.email === email);
      if (userExists) {
        alert("User already exists. Please log in.");
        navigate("/Login");
        return;
      }
  
      const newUser = { email, password };
  
      await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
  
      localStorage.setItem("authToken", email);
      navigate("/login");
    } catch (error) {
      console.error("Error during signup:", error);
      alert("An error occurred. Please try again.");
    }
  };
  

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={img} alt="Background" className="login-img" />
        <div className="overlay-text">
          <h1>Create your Free Account</h1>
          <p>Share your artwork and get projects!</p>
        </div>
      </div>

      <div className="login-right">
        <h2>Signup</h2>
        <p>
          Already have an account?{" "}
          <Link to="/" className="link">
            Login
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
          className="input"
        />
        {emailError && <p className="error-text">{emailError}</p>}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />

        <button onClick={handleSignup} className="btn-primary" disabled={!validateEmail(email)}>
          Signup
        </button>

        <div className="social-login-container">
          <GoogleAuth />
          <FacebookAuth />
        </div>
      </div>
    </div>
  );
};

export default Signup;
