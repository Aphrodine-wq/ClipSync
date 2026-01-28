import { create } from 'zustand';
import axios from 'axios';
import apiClient from '../services/api';
import wsClient from '../services/websocket';

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  paywallData: null, // Store paywall info when device limit exceeded

  // Initialize auth (check for existing token)
  initialize: async () => {
    try {
      set({ isLoading: true });
      
      const token = apiClient.getToken();
      
      if (token) {
        // Verify token and get user
        const data = await apiClient.getCurrentUser();
        set({ 
          user: data.user, 
          isAuthenticated: true, 
          isLoading: false 
        });
        
        // Connect WebSocket
        wsClient.connect(token);
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Token might be invalid, clear it
      apiClient.setToken(null);
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: error.message 
      });
    }
  },

  // Login with Google
  loginWithGoogle: async (credential) => {
    try {
      set({ isLoading: true, error: null, paywallData: null });
      
      const data = await apiClient.loginWithGoogle(credential);
      
      set({ 
        user: data.user, 
        isAuthenticated: true, 
        isLoading: false,
        paywallData: null
      });
      
      // Connect WebSocket
      wsClient.connect(data.token);
      
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      
      // Check if error is device limit exceeded
      if (error.response?.data?.requiresUpgrade) {
        const paywallData = {
          currentPlan: error.response.data.currentPlan,
          requiredPlan: error.response.data.requiredPlan,
          currentDevices: error.response.data.currentDevices,
          maxDevices: error.response.data.maxDevices,
        };
        set({ 
          paywallData,
          isLoading: false 
        });
        throw { ...error, paywallData };
      }
      
      set({ 
        error: error.message, 
        isLoading: false,
        paywallData: null
      });
      throw error;
    }
  },
  
  // Clear paywall data
  clearPaywall: () => {
    set({ paywallData: null });
  },

  /**
   *  Register a new user with email and password
   */
  register: async (email, name, password) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.post('/auth/register', { email, name, password });
      apiClient.setToken(response.token);
      set({ user: response.user, isAuthenticated: true });
      wsClient.connect(response.token);
      return response.data;
    } catch (error) {
      console.error('Error during registration: ', error.response.data.error || error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   *  Login an existing user with email and password
   */
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      apiClient.setToken(response.token);
      set({ user: response.user, isAuthenticated: true });
      wsClient.connect(response.token);
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response.data.error || error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Logout
  logout: async () => {
    try {
      await apiClient.logout();
      wsClient.disconnect();
      
      set({ 
        user: null, 
        isAuthenticated: false, 
        error: null 
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      apiClient.setToken(null);
      wsClient.disconnect();
      
      set({ 
        user: null, 
        isAuthenticated: false 
      });
    }
  },

  // Delete account
  deleteAccount: async () => {
    try {
      await apiClient.deleteAccount();
      wsClient.disconnect();
      
      set({ 
        user: null, 
        isAuthenticated: false, 
        error: null 
      });
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  },

  // Update user data
  updateUser: (userData) => {
    set({ user: { ...get().user, ...userData } });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Check if user has a specific plan
  hasPlan: (plans) => {
    const { user } = get();
    if (!user) return false;
    
    const allowedPlans = Array.isArray(plans) ? plans : [plans];
    return allowedPlans.includes(user.plan);
  },

  // Check if user is on free plan
  isFreePlan: () => {
    const { user } = get();
    return user?.plan === 'free';
  },

  // Check if user is on pro plan or higher
  isProPlan: () => {
    const { user } = get();
    return ['pro', 'team', 'enterprise'].includes(user?.plan);
  },

  // Dev mode - bypass authentication with mock user
  enableDevMode: () => {
    const mockUser = {
      id: 'dev-user-123',
      email: 'dev@clipsync.local',
      name: 'Developer',
      picture: null,
      plan: 'pro',
    };
    set({ 
      user: mockUser, 
      isAuthenticated: true, 
      isLoading: false,
      error: null 
    });
    console.log('🔧 Dev mode enabled - Mock user authenticated');
  },
}));

export default useAuthStore;
