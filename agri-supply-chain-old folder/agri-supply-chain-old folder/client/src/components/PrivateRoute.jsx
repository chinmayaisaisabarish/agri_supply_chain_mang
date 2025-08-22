import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Get the role from the path
  const pathRole = location.pathname.split('/')[1];

  // If trying to access admin routes
  if (pathRole === 'admin') {
    if (user.role !== 'admin') {
      return <Navigate to="/login" replace />;
    }
    return children;
  }

  // If trying to access role-specific routes
  if (pathRole !== 'profile' && pathRole !== user.role) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
};

export default PrivateRoute; 