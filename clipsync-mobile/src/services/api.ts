/**
 * API Client
 * Handles all API communication
 */

const API_URL = process.env.API_URL || 'http://localhost:3001/api';

class ApiClient {
  private token: string | null = null;
  private baseURL: string;

  constructor(baseURL: string = API_URL) {
    this.baseURL = baseURL;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<unknown> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          const refreshed = await useAuthStore.getState().refreshAuth();
          if (refreshed) {
            // Retry request
            return this.request(endpoint, options);
          }
          throw new Error('Authentication failed');
        }
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  async get(endpoint: string): Promise<unknown> {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data?: Record<string, unknown>): Promise<unknown> {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data?: Record<string, unknown>): Promise<unknown> {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string): Promise<unknown> {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

// Import useAuthStore for token refresh
import { useAuthStore } from '../store/useAuthStore';

