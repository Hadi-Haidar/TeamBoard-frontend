import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // This page will be shown briefly while Google processes the callback
    // Your GoogleController will handle the actual processing
    // and redirect appropriately
    
    // If we reach this page, something went wrong
    setTimeout(() => {
      navigate('/signin', { 
        state: { 
          message: 'Authentication completed. Please try signing in again.',
          type: 'info'
        }
      });
    }, 3000);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-600">Processing Google authentication...</p>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;
