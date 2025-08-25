import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail, resendVerification, loading } = useAuth();
  
  const email = location.state?.email || '';
  const [verificationCode, setVerificationCode] = useState('');
  const [message, setMessage] = useState(location.state?.message || '');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const result = await verifyEmail(email, verificationCode);
    
    if (result.success) {
      setMessage('Email verified successfully! Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 2000);
    } else {
      setError(result.message || 'Verification failed');
    }
  };

  const handleResendCode = async () => {
    setError('');
    setMessage('');
    
    const result = await resendVerification(email);
    
    if (result.success) {
      setMessage('Email verified successfully! Redirecting to login...'); 
      setTimeout(() => navigate('/signin'), 2000);                       
    } else {
      setError(result.message || 'Verification failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify Your Email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We sent a verification code to <strong>{email}</strong>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {message && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <div className="mt-1">
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="input-field"
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleResendCode}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Didn't receive the code? Resend
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
