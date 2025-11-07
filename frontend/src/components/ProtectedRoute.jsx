import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
  // Get current user from localStorage
  const currentUser = localStorage.getItem('currentUser');
  const token = localStorage.getItem('token');

  // Check if user is logged in
  if (!token || !currentUser) {
    alert('⚠️ Please login to access this page');
    return <Navigate to="/Role" replace />;
  }

  // Parse user data
  let user;
  try {
    user = JSON.parse(currentUser);
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    return <Navigate to="/Role" replace />;
  }

  // Check if user's role matches the allowed role
  if (user.role !== allowedRole) {
    alert(`⚠️ Access Denied! You are logged in as "${user.role}". Please access your dashboard at /${user.role}`);
    return <Navigate to={`/${user.role}`} replace />;
  }

  // User is authenticated and has correct role
  return children;
};

export default ProtectedRoute;
