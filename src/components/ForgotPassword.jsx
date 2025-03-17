import { useState } from "react";
import { Link } from "react-router-dom";
import img from "../assets/img.webp";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleReset = async () => {
    try {
      const response = await fetch("http://localhost:5000/users");
      const users = await response.json();
      const user = users.find((user) => user.email === email);

      if (user) {
        setPassword(`Your password: ${user.password}`);
        setError("");
      } else {
        setPassword("");
        setError("Email not found.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error("Error fetching users:", error);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-left">
        <img src={img} alt="Background" className="forgot-img" />
        <div className="forgot-overlay-text">
          <h1>Reset Password</h1>
          <p className="p-text">Enter your email to retrieve your password.</p>
        </div>
      </div>

      <div className="forgot-right">
        <h2 className="forgot-title">Forgot Password</h2>
        <p className="forgot-text">Enter your email to view your password.</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="forgot-input"
        />

        <button onClick={handleReset} className="forgot-btn" disabled={!email}>
          Get Password
        </button>

        {password && <p className="success-text">{password}</p>}
        {error && <p className="error-text">{error}</p>}

        <div className="back-to-login">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
