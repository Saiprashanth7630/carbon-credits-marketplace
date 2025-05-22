import React from 'react';
import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const adminToken = localStorage.getItem('adminToken');
  const adminUser = JSON.parse(localStorage.getItem('adminUser'));
  
  if (!adminToken || !adminUser || adminUser.role !== 'admin') {
    // Clear any partial admin data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
} 