import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
import Login from "../components/login/Login";
import Signup from "../components/login/Signup";
import ForgotPassword from "../components/login/ForgotPassword";
import Manager from "../components/Manager/Manager";
import KanbanBoard from "../components/kanbanBoard/KanbanBoard";
import TaskManagement from "../components/TaskManager/TaskManagement";
import Teams from "../components/Team/Teams";
import User from "../components/User/User";
import Profile from "../components/Profile/Profile";
import Settings from "../components/Dashboard/Settings";
import Dashboard from "../components/Dashboard/Dashboard";
import ProtectedRoute from "./ProtectedRoute";

const AppRouter = () => {
  const auth = isAuthenticated();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={auth ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={auth ? <Navigate to="/dashboard" /> : <Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/manager" element={<ProtectedRoute><Manager /></ProtectedRoute>} />
        <Route path="/kanbanboard" element={<ProtectedRoute><KanbanBoard /></ProtectedRoute>} />
        <Route path="/task-management" element={<ProtectedRoute><TaskManagement /></ProtectedRoute>} />
        <Route path="/team" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><User /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to={auth ? "/dashboard" : "/login"} />} />
        <Route path="*" element={<Navigate to={auth ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
