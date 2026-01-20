/**
 * Platform-agnostic API Client
 * Handles HTTP requests to ClipSync backend
 */

export class ApiClient {
  /**
   * @param {Object} options - Configuration options
   * @param {string} options.baseURL - Base URL for API requests
   * @param {Function} options.getToken - Function to get auth token
   * @param {Function} options.setToken - Function to set auth token (optional, for auto-save)
   * @param {Function} options.onTokenExpired - Callback when token expires (optional)
   */
  constructor(options = {}) {
    this.baseURL = options.baseURL || 'http://localhost:3001/api';
    this.getToken = options.getToken || (() => null);
    this.setToken = options.setToken || (() => {});
    this.onTokenExpired = options.onTokenExpired || null;
  }

  /**
   * Make HTTP request
   * @param {string} endpoint - API endpoint
   * @param {RequestInit} options - Fetch options
   * @returns {Promise<any>}
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401 && this.onTokenExpired) {
          const refreshed = await this.onTokenExpired();
          if (refreshed) {
            // Retry request with new token
            return this.request(endpoint, options);
          }
        }

        const error = new Error(data.error || 'Request failed');
        error.response = {
          status: response.status,
          data: data,
        };
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      // Preserve response data if it exists
      if (error.response) {
        throw error;
      }
      // If it's a network error, wrap it
      const wrappedError = new Error(error.message || 'Network error');
      wrappedError.originalError = error;
      throw wrappedError;
    }
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @returns {Promise<any>}
   */
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {any} data - Request body
   * @returns {Promise<any>}
   */
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {any} data - Request body
   * @returns {Promise<any>}
   */
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {any} data - Request body
   * @returns {Promise<any>}
   */
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise<any>}
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}
