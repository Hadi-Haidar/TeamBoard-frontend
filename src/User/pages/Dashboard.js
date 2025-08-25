import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessingGoogleAuth, setIsProcessingGoogleAuth] = useState(false);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const googleAuth = urlParams.get('google_auth');
      const errorMessage = urlParams.get('message');
      
      if (googleAuth === 'error') {
        // Clear URL parameters and show error
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate('/signin', { 
          state: { 
            message: errorMessage || 'Google authentication failed',
            type: 'error'
          }
        });
        return;
      }
      
      if (googleAuth === 'success' && !isProcessingGoogleAuth) {
        setIsProcessingGoogleAuth(true);
        
        try {
          // Clear URL parameters first
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Small delay to ensure backend session is established
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Validate session-based authentication
          const { default: authStateManager } = await import('../services/AuthStateManager');
          const result = await authStateManager.handleGoogleAuthSession();
          
          if (!result.success) {
            throw new Error(result.message || 'Session validation failed');
          }
          
        } catch (error) {
          navigate('/signin', {
            state: {
              message: 'Failed to complete Google authentication. Please try again.',
              type: 'error'
            }
          });
        } finally {
          setIsProcessingGoogleAuth(false);
        }
      }
    };

    handleGoogleCallback();
  }, [navigate, isProcessingGoogleAuth]);

  if (isProcessingGoogleAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600">Completing authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Navigation */}
      <Navbar />
      
      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to TeamBoard!
              </h1>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
