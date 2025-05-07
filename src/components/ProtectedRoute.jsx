import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useUser();
  const token = localStorage.getItem('token');

  if (!user || !token) {
    return <Navigate to="/auth/signin" replace />;
  }

  return children;
};

export default ProtectedRoute; 