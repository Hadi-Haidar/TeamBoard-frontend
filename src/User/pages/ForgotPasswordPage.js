import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [buttonState, setButtonState] = useState('idle');
  const { forgotPassword } = useAuth();

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) setErrors({});
    if (buttonState === 'error') setButtonState('idle');
  };

  const validateForm = () => {
    if (!email) {
      setErrors({ email: 'Email is required' });
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Please enter a valid email' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setButtonState('sending');
    setMessage('');
    
    const result = await forgotPassword(email);
    
    if (result.success) {
      setButtonState('success');
      setMessage(result.message || 'Password reset email sent successfully!');
      setTimeout(() => setIsSubmitted(true), 1000);
    } else {
      setButtonState('error');
      setMessage(result.error || 'Failed to send password reset email');
      setTimeout(() => setButtonState('idle'), 3000);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setEmail('');
    setMessage('');
    setButtonState('idle');
  };

  const buttonConfig = {
    idle: { text: 'Send Reset Link', className: 'btn-primary', icon: null },
    sending: { 
      text: 'Sending Reset Link...', 
      className: 'bg-blue-400 text-white cursor-not-allowed',
      icon: <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
    },
    success: { 
      text: 'Email Sent Successfully!', 
      className: 'bg-green-500 text-white cursor-not-allowed',
      icon: <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
      </svg>
    },
    error: { 
      text: 'Failed - Try Again', 
      className: 'bg-red-500 hover:bg-red-600 text-white',
      icon: <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    }
  };

  const currentButton = buttonConfig[buttonState];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <Link to="/" className="text-3xl font-bold text-primary-600 mb-6 block">TeamBoard</Link>
          <div className="bg-white p-8 rounded-lg shadow">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
            <p className="text-gray-600 mb-6">We've sent a password reset link to <strong>{email}</strong></p>
            <div className="space-y-4">
              <Link to="/signin" className="w-full btn-primary block text-center">Back to Sign In</Link>
              <button onClick={resetForm} className="w-full btn-secondary">Try another email</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-primary-600">TeamBoard</Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Forgot your password?</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your email address and we'll send you a link to reset your password.</p>
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
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleChange}
                className={`mt-1 input-field ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <button
              type="submit"
              disabled={buttonState === 'sending' || buttonState === 'success'}
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

export default ForgotPasswordPage;
