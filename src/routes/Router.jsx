import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "../components/Login";
import Signup from "../components/Signup";
import ProtectedRoute from "../components/ProtectedRoute";
import { isAuthenticated } from "../utils/auth";
import ForgotPassword from "../components/ForgotPassword";
import Sidebar from "../components/sidebar/Sidebar";
import User from "../components/sidebar/User";
import Manager from "../components/sidebar/Manager";
import Settings from "../components/sidebar/Settings";
import Dashboard from "../components/Dashboard/Dashboard";
import TaskManagement from "../components/sidebar/TaskManagement";

const AppRouter = () => {
  const auth = isAuthenticated();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={auth ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={auth ? <Navigate to="/dashboard" /> : <Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/sidebar" element={<Sidebar />} />
        <Route path="/manager" element={<Manager />} />
        <Route path="/task-management" element={<TaskManagement />} />
        <Route path="/users" element={<User />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to={auth ? "/dashboard" : "/login"} />} />
        <Route path="*" element={<Navigate to={auth ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
