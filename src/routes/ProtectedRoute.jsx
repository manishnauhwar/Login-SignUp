import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const authenticated = isAuthenticated();
  const user = JSON.parse(localStorage.getItem('user'));

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length === 0) {
    return children;
  }

  if (user && allowedRoles.includes(user.role)) {
    return children;
  }

  return <Navigate to="/dashboard" replace />;
};

export default ProtectedRoute;
