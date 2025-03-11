import {  useNavigate } from "react-router-dom";
import "../App.css";
import { logout } from "../utils/auth";
import backgroundImage from "../assets/bg.jpg";

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="home-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="overlay"></div> 
      <div className="home-card">
        <h1 className="home-title">Welcome to Excellence Hub</h1>
        <p className="home-subtitle">
          Unlock the power of technology. Connect, Learn, and Innovate!
        </p>
        <div className="home-actions">
          <button onClick={handleLogout} className="home-btn">Logout</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
