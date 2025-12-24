import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center p-4">Checking authentication...</div>;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.map(r => r.toLowerCase()).includes(user.role?.toLowerCase())
  ) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
