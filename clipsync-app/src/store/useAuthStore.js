import { create } from 'zustand';
import apiClient from '../services/api';
import wsClient from '../services/websocket';

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

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
      set({ isLoading: true, error: null });
      
      const data = await apiClient.loginWithGoogle(credential);
      
      set({ 
        user: data.user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      // Connect WebSocket
      wsClient.connect(data.token);
      
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      set({ 
        error: error.message, 
        isLoading: false 
      });
      throw error;
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
}));

export default useAuthStore;
