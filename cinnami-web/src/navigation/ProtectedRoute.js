// src/navigation/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRole }) {
  const role = localStorage.getItem('role');
  if (!role || role !== allowedRole) {
    // Si no hay sesión o el rol no coincide, manda al login
    return <Navigate to="/" replace />;
  }
  return children;
}
