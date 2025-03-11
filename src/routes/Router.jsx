import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "../components/Login";
import Signup from "../components/Signup";
import Home from "../components/Home";
import Dashboard from "../components/Dashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import { isAuthenticated } from "../utils/auth";
import ForgotPassword from "../components/ForgotPassword";



const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated() ? <Navigate to="/home" /> : <Login />} />
        <Route path="*" element={isAuthenticated() ? <Navigate to="/home" /> : <Navigate to="/login" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/login" element={isAuthenticated() ? <Navigate to="/home" /> : <Login />} />
        <Route path="/signup" element={isAuthenticated() ? <Navigate to="/home" /> : <Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
