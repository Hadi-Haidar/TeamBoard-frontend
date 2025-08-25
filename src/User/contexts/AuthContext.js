import React, { createContext, useContext, useState, useEffect } from 'react';
import authStateManager from '../services/AuthStateManager';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(authStateManager.getState());

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authStateManager.subscribe(setAuthState);
    
    // Initialize if not already done
    if (!authState.isInitialized) {
      authStateManager.initialize();
    }

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Cleanup on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      authStateManager.destroy();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const login = async (email, password) => {
    return await authStateManager.login({ email, password });
  };

  const logout = async () => {
    return await authStateManager.logout();
  };

  const register = async (name, email, password, confirmPassword) => {
    return await authService.register({ name, email, password, confirmPassword });
  };

  const forgotPassword = async (email) => {
    return await authService.forgotPassword(email);
  };

  const verifyEmail = async (email, code) => {
    return await authService.verifyEmail({ email, code });
  };

  const resendVerification = async (email) => {
    return await authService.resendVerification(email);
  };

  const googleAuth = async () => {
    return await authService.googleAuth();
  };

  const value = {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.isLoading,
    initializing: !authState.isInitialized,
    error: authState.error,
    login,
    register,
    logout,
    forgotPassword,
    googleAuth,
    verifyEmail,
    resendVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
