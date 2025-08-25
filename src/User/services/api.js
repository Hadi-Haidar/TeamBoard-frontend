const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.csrfInitialized = false;
    this.csrfInitPromise = null;
  }

  async initializeCsrf() {
    if (this.csrfInitialized) return;
    
    if (this.csrfInitPromise) {
      return this.csrfInitPromise;
    }
    
    this.csrfInitPromise = this._doInitializeCsrf();
    return this.csrfInitPromise;
  }

  async _doInitializeCsrf() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/sanctum/csrf-cookie`, {
        method: 'GET',
        credentials: 'include',
        headers: { 
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
      });
      
      if (response.ok) {
        this.csrfInitialized = true;
        this.csrfInitPromise = null;
      } else {
        this.csrfInitPromise = null;
        throw new Error('CSRF initialization failed');
      }
    } catch (error) {
      this.csrfInitPromise = null;
      throw error;
    }
  }

  async request(endpoint, options = {}) {
    const needsCSRF = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method);
    if (needsCSRF) {
      await this.initializeCsrf();
    }

    const url = `${this.baseURL}${endpoint}`;
    const csrfToken = needsCSRF ? this.getCsrfToken() : null;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(csrfToken && { 'X-XSRF-TOKEN': csrfToken }),
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please sign in again.');
        }
        
        if (response.status === 422) {
          throw new ValidationError(data.message || 'Validation failed', data.errors || {});
        }
        
        if (response.status === 419) {
          this.csrfInitialized = false;
          this.csrfInitPromise = null;
          await this.initializeCsrf();
          
          const retryResponse = await fetch(url, {
            ...config,
            headers: {
              ...config.headers,
              'X-XSRF-TOKEN': this.getCsrfToken()
            }
          });
          
          if (retryResponse.ok) {
            return await retryResponse.json();
          } else {
            const retryErrorData = await retryResponse.json();
            throw new Error(retryErrorData.message || `HTTP error! status: ${retryResponse.status}`);
          }
        }
        
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error(error.message || 'Network error occurred');
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  getCsrfToken() {
    const name = 'XSRF-TOKEN';
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return decodeURIComponent(parts.pop().split(';').shift());
    }
    return null;
  }
}

class ValidationError extends Error {
  constructor(message, errors = {}) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export { ValidationError };
export default new ApiService();
