import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();
  
  // Check if this is a Google OAuth callback
  const urlParams = new URLSearchParams(location.search);
  const hasGoogleCallback = urlParams.get('google_auth') === 'success';
  
  // Allow Google OAuth callbacks to proceed even if not authenticated yet
  if (hasGoogleCallback) {
    return children;
  }
  
  // Don't redirect while still initializing auth state
  if (initializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/signin" replace />;
};

export default ProtectedRoute;
