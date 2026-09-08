import { Navigate } from "react-router-dom";
import { isAuthenticated, getUser } from "../utils/auth";

function ProtectedRoute({ children, allowedRoles }) {
  const isAuth = isAuthenticated();
  const user = getUser();

  if (!isAuth) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;