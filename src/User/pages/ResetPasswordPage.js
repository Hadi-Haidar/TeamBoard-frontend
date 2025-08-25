import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    token: searchParams.get('token') || '',
    email: searchParams.get('email') || '',
    password: '',
    password_confirmation: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [buttonState, setButtonState] = useState('idle');

  useEffect(() => {
    // Validate that we have token and email from URL
    if (!formData.token || !formData.email) {
      setMessage('Invalid reset link. Please request a new password reset.');
      setButtonState('error');
    }
  }, [formData.token, formData.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (buttonState === 'error') {
      setButtonState('idle');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'Please confirm your password';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setButtonState('sending');
    setMessage('');
    
    const result = await authService.resetPassword(formData);
    
    if (result.success) {
      setButtonState('success');
      setMessage(result.message || 'Password reset successfully!');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/signin', { 
          state: { 
            message: 'Password reset successfully! Please sign in with your new password.',
            type: 'success'
          }
        });
      }, 2000);
    } else {
      setButtonState('error');
      setMessage(result.message || 'Failed to reset password');
      if (result.errors) {
        setErrors(result.errors);
      }
      setTimeout(() => setButtonState('idle'), 3000);
    }
  };

  const buttonConfig = {
    idle: { text: 'Reset Password', className: 'btn-primary' },
    sending: { 
      text: 'Resetting Password...', 
      className: 'bg-blue-400 text-white cursor-not-allowed',
      icon: <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
    },
    success: { 
      text: 'Password Reset Successfully!', 
      className: 'bg-green-500 text-white cursor-not-allowed',
      icon: <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
      </svg>
    },
    error: { 
      text: 'Try Again', 
      className: 'bg-red-500 hover:bg-red-600 text-white'
    }
  };

  const currentButton = buttonConfig[buttonState];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-primary-600">TeamBoard</Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Reset your password</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your new password below</p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {/* Message Display */}
          {message && (
            <div className={`mb-4 p-3 rounded flex items-center ${
              buttonState === 'success' ? 'bg-green-100 text-green-700' : 
              buttonState === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {buttonState === 'success' && currentButton.icon}
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email display */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border text-sm text-gray-600">
                {formData.email}
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 input-field ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                placeholder="Enter your new password"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                value={formData.password_confirmation}
                onChange={handleChange}
                className={`mt-1 input-field ${errors.password_confirmation ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                placeholder="Confirm your new password"
              />
              {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>}
            </div>

            <button
              type="submit"
              disabled={buttonState === 'sending' || buttonState === 'success' || (!formData.token || !formData.email)}
              className={`w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${currentButton.className} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {currentButton.icon}
              {currentButton.text}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/signin" className="font-medium text-primary-600 hover:text-primary-500">Back to Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
