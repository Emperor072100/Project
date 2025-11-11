import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  const token = authService.getToken();
  
  console.log('🔐 ProtectedRoute - Estado de autenticación:', {
    isAuthenticated,
    hasToken: !!token,
    currentPath: window.location.pathname
  });
  
  if (!isAuthenticated) {
    console.log('🚫 No autenticado, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('✅ Autenticado correctamente, renderizando contenido');
  return children;
};

export default ProtectedRoute;