import apiService, { ValidationError } from './api';

class AuthService {
  // Register new user
  async register(userData) {
    try {
      const response = await apiService.post('/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.confirmPassword,
      });

      return {
        success: true,
        user: response.user,
        message: response.message
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          errors: error.errors,
          message: error.message
        };
      }
      return {
        success: false,
        message: error.message || 'Registration failed'
      };
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await apiService.post('/login', {
        email: credentials.email,
        password: credentials.password,
      });

      return {
        success: true,
        user: response.user,
        message: response.message
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          errors: error.errors,
          message: error.message
        };
      }
      return {
        success: false,
        message: error.message || 'Login failed'
      };
    }
  }

  // Logout user
  async logout() {
    try {
      await apiService.post('/logout');
      return { success: true };
    } catch (error) {
      return { success: true }; // Clear local state even if server logout fails
    }
  }

  // Send password reset email
  async forgotPassword(email) {
    try {
      const response = await apiService.post('/forgot-password', { email });
      return {
        success: true,
        message: response.message || 'Password reset email sent successfully'
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          errors: error.errors,
          message: error.message
        };
      }
      return {
        success: false,
        message: error.message || 'Failed to send password reset email'
      };
    }
  }

  // Reset password
  async resetPassword(data) {
    try {
      const response = await apiService.post('/reset-password', {
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        token: data.token,
      });

      return {
        success: true,
        message: response.message || 'Password reset successfully'
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          errors: error.errors,
          message: error.message
        };
      }
      return {
        success: false,
        message: error.message || 'Password reset failed'
      };
    }
  }

  // Verify email
  async verifyEmail(data) {
    try {
      const response = await apiService.post('/verify-email', {
        email: data.email,
        code: data.code,
      });

      return {
        success: true,
        message: response.message || 'Email verified successfully'
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          errors: error.errors,
          message: error.message
        };
      }
      return {
        success: false,
        message: error.message || 'Email verification failed'
      };
    }
  }

  // Resend verification code
  async resendVerification(email) {
    try {
      const response = await apiService.post('/resend-verification', { email });
      return {
        success: true,
        message: response.message || 'Verification code sent successfully'
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          errors: error.errors,
          message: error.message
        };
      }
      return {
        success: false,
        message: error.message || 'Failed to send verification code'
      };
    }
  }

  // Google authentication redirect
  async googleAuth() {
    try {
      // Get the redirect URL from backend
      const response = await apiService.get('/auth/google');
      
      if (response.redirect_url) {
        // Redirect to Google OAuth
        window.location.href = response.redirect_url;
      } else {
        throw new Error('No redirect URL received');
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Google authentication failed'
      };
    }
  }



  // Get current user
  async getCurrentUser() {
    try {
      const response = await apiService.get('/user');
      return {
        success: true,
        user: response.user || response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to get user data'
      };
    }
  }
}

export default new AuthService();