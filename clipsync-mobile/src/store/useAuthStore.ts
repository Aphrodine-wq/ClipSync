/**
 * Authentication Store
 * Manages user authentication state
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  plan: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  login: (token: string, refreshToken: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      const token = await AsyncStorage.getItem('clipsync_token');
      const refreshToken = await AsyncStorage.getItem('clipsync_refresh_token');
      const userStr = await AsyncStorage.getItem('clipsync_user');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({
          token,
          refreshToken,
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        // Set API token
        apiClient.setToken(token);
      } else {
        set({ isLoading: false });
      }

      // Set refresh callback
      apiClient.setRefreshAuthCallback(() => get().refreshAuth());
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false });
    }
  },

  login: async (token: string, refreshToken: string, user: User) => {
    try {
      await AsyncStorage.multiSet([
        ['clipsync_token', token],
        ['clipsync_refresh_token', refreshToken],
        ['clipsync_user', JSON.stringify(user)],
      ]);

      apiClient.setToken(token);

      set({
        token,
        refreshToken,
        user,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.multiRemove([
        'clipsync_token',
        'clipsync_refresh_token',
        'clipsync_user',
      ]);

      apiClient.setToken(null);

      set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  refreshAuth: async () => {
    const { refreshToken } = get();
    if (!refreshToken) return false;

    try {
      const response = await apiClient.post('/auth/refresh', {
        refreshToken,
      });

      if (response.token) {
        await AsyncStorage.setItem('clipsync_token', response.token);
        apiClient.setToken(response.token);
        set({ token: response.token });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      get().logout();
      return false;
    }
  },
}));

