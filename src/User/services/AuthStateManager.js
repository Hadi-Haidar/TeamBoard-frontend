/**
 * Professional Authentication State Manager
 * Handles race conditions, concurrent requests, and state persistence
 * Using Singleton pattern with proper error handling and observability
 */

class AuthStateManager {
  constructor() {
    if (AuthStateManager.instance) {
      return AuthStateManager.instance;
    }

    // State management
    this.state = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null
    };

    // Observers for state changes
    this.observers = new Set();
    
    // Request management
    this.activeRequests = new Map();
    this.abortControllers = new Map();
    
    // Storage keys
    this.STORAGE_KEYS = {
      AUTH_STATE: 'auth_state',
      USER_CACHE: 'user_cache',
      AUTH_LOCK: 'auth_lock',
      LAST_CHECK: 'last_auth_check'
    };

    // Configuration
    this.config = {
      lockTimeout: 5000, // 5 seconds
      retryDelay: 1000,
      maxRetries: 3,
      cacheExpiry: 300000 // 5 minutes
    };

    AuthStateManager.instance = this;
    this.initialize();
  }

  /**
   * Initialize authentication state
   */
  async initialize() {
    const lockKey = this.STORAGE_KEYS.AUTH_LOCK;
    const now = Date.now();
    
    try {
      // Check if another instance is already initializing
      const existingLock = this.getLock();
      
      if (existingLock && (now - existingLock.timestamp) < this.config.lockTimeout) {
        // Wait for existing initialization to complete
        await this.waitForInitialization();
        return;
      }

      // Acquire lock
      this.setLock(now);
      
      // Load cached state
      this.loadCachedState();
      
      // Validate authentication if needed
      if (this.shouldValidateAuth()) {
        await this.validateAuthentication();
      }
      
    } catch (error) {
      this.handleError('Initialization failed', error);
    } finally {
      this.releaseLock();
      this.updateState({ isInitialized: true, isLoading: false });
    }
  }

  /**
   * Validate current authentication status
   */
  async validateAuthentication() {
    const requestId = 'validate_auth';
    
    try {
      // Cancel any existing validation request
      this.cancelRequest(requestId);
      
      // Create new abort controller
      const abortController = new AbortController();
      this.abortControllers.set(requestId, abortController);
      
      this.updateState({ isLoading: true, error: null });
      
      const { default: authService } = await import('./authService');
      const result = await authService.getCurrentUser();
      
      if (abortController.signal.aborted) return;
      
      if (result.success) {
        this.setAuthenticatedState(result.user);
      } else {
        this.setUnauthenticatedState();
      }
      
    } catch (error) {
      if (error.name === 'AbortError') return;
      
      // Only clear auth on session expiration
      if (error.message?.includes('Session expired')) {
        this.setUnauthenticatedState();
      } else {
        this.handleError('Auth validation failed', error);
      }
    } finally {
      this.abortControllers.delete(requestId);
      this.updateState({ isLoading: false });
    }
  }

  /**
   * Login user
   */
  async login(credentials) {
    const requestId = 'login';
    
    try {
      this.cancelRequest(requestId);
      const abortController = new AbortController();
      this.abortControllers.set(requestId, abortController);
      
      this.updateState({ isLoading: true, error: null });
      
      const { default: authService } = await import('./authService');
      const result = await authService.login(credentials);
      
      if (abortController.signal.aborted) return { success: false, message: 'Request cancelled' };
      
      if (result.success) {
        this.setAuthenticatedState(result.user);
        return { success: true, message: result.message };
      } else {
        this.updateState({ error: result.message });
        return result;
      }
      
    } catch (error) {
      if (error.name === 'AbortError') return { success: false, message: 'Request cancelled' };
      
      const errorMessage = error.message || 'Login failed';
      this.handleError('Login failed', error);
      return { success: false, message: errorMessage };
    } finally {
      this.abortControllers.delete(requestId);
      this.updateState({ isLoading: false });
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      // Cancel all ongoing requests
      this.cancelAllRequests();
      
      this.updateState({ isLoading: true });
      
      const { default: authService } = await import('./authService');
      await authService.logout();
      
    } catch (error) {
      console.warn('Logout request failed, but clearing local state:', error.message);
    } finally {
      this.setUnauthenticatedState();
      this.updateState({ isLoading: false });
    }
    
    return { success: true };
  }

  /**
   * Set authenticated state
   */
  setAuthenticatedState(user, authType = 'session') {
    const authState = {
      isAuthenticated: true,
      authType, // 'session' or 'token'
      timestamp: Date.now()
    };
    
    this.updateState({
      user,
      isAuthenticated: true,
      error: null
    });
    
    // Persist state
    sessionStorage.setItem(this.STORAGE_KEYS.AUTH_STATE, JSON.stringify(authState));
    sessionStorage.setItem(this.STORAGE_KEYS.USER_CACHE, JSON.stringify({
      user,
      timestamp: Date.now()
    }));
    localStorage.setItem(this.STORAGE_KEYS.AUTH_STATE, JSON.stringify(authState));
  }

  /**
   * Set unauthenticated state
   */
  setUnauthenticatedState() {
    this.updateState({
      user: null,
      isAuthenticated: false,
      error: null
    });
    
    // Clear all auth data
    sessionStorage.removeItem(this.STORAGE_KEYS.AUTH_STATE);
    sessionStorage.removeItem(this.STORAGE_KEYS.USER_CACHE);
    localStorage.removeItem(this.STORAGE_KEYS.AUTH_STATE);
  }

  /**
   * Handle Google OAuth session (for web authentication)
   */
  async handleGoogleAuthSession() {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second
    
    try {
      // Retry logic to handle race conditions
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // Wait a bit to allow session to be established
          if (attempt > 1) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
          }
          
          // Validate the session-based authentication
          await this.validateAuthentication();
          
          return { success: true };
          
        } catch (error) {
          if (attempt === maxRetries) {
            throw error;
          }
          // Continue to next attempt
          continue;
        }
      }
      
    } catch (error) {
      this.setUnauthenticatedState();
      return { success: false, message: error.message };
    }
  }

  /**
   * Load cached state from storage
   */
  loadCachedState() {
    try {
      const authStateStr = sessionStorage.getItem(this.STORAGE_KEYS.AUTH_STATE) ||
                          localStorage.getItem(this.STORAGE_KEYS.AUTH_STATE);
      
      if (!authStateStr) return;
      
      const authState = JSON.parse(authStateStr);
      const now = Date.now();
      
      // Check if cached state is still valid
      if (authState.isAuthenticated && (now - authState.timestamp) < this.config.cacheExpiry) {
        const userCacheStr = sessionStorage.getItem(this.STORAGE_KEYS.USER_CACHE);
        let user = null;
        
        if (userCacheStr) {
          const userCache = JSON.parse(userCacheStr);
          if ((now - userCache.timestamp) < this.config.cacheExpiry) {
            user = userCache.user;
          }
        }
        
        this.updateState({
          isAuthenticated: true,
          user
        });
      }
    } catch (error) {
      console.warn('Failed to load cached auth state:', error);
    }
  }

  /**
   * Check if auth validation is needed
   */
  shouldValidateAuth() {
    if (!this.state.isAuthenticated) return false;
    
    const lastCheckStr = sessionStorage.getItem(this.STORAGE_KEYS.LAST_CHECK);
    if (!lastCheckStr) return true;
    
    const lastCheck = parseInt(lastCheckStr);
    const now = Date.now();
    
    // Validate if last check was more than 5 minutes ago
    return (now - lastCheck) > this.config.cacheExpiry;
  }

  /**
   * Lock management
   */
  getLock() {
    const lockStr = sessionStorage.getItem(this.STORAGE_KEYS.AUTH_LOCK);
    return lockStr ? JSON.parse(lockStr) : null;
  }

  setLock(timestamp) {
    sessionStorage.setItem(this.STORAGE_KEYS.AUTH_LOCK, JSON.stringify({
      timestamp,
      id: Math.random().toString(36).substr(2, 9)
    }));
  }

  releaseLock() {
    sessionStorage.removeItem(this.STORAGE_KEYS.AUTH_LOCK);
  }

  /**
   * Wait for initialization to complete
   */
  async waitForInitialization() {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const lock = this.getLock();
        if (!lock) {
          clearInterval(checkInterval);
          this.loadCachedState();
          resolve();
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 10000);
    });
  }

  /**
   * Request management
   */
  cancelRequest(requestId) {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  cancelAllRequests() {
    this.abortControllers.forEach((controller) => controller.abort());
    this.abortControllers.clear();
  }

  /**
   * State management
   */
  updateState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifyObservers();
    
    // Update last check timestamp
    if (newState.isAuthenticated !== undefined) {
      sessionStorage.setItem(this.STORAGE_KEYS.LAST_CHECK, Date.now().toString());
    }
  }

  getState() {
    return { ...this.state };
  }

  /**
   * Observer pattern for React components
   */
  subscribe(observer) {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  notifyObservers() {
    this.observers.forEach(observer => observer(this.state));
  }

  /**
   * Error handling
   */
  handleError(message, error) {
    console.error(message, error);
    this.updateState({ 
      error: error.message || message,
      isLoading: false 
    });
  }

  /**
   * Cleanup
   */
  destroy() {
    this.cancelAllRequests();
    this.observers.clear();
    this.releaseLock();
  }
}

export default new AuthStateManager();
