import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user, accessToken } = response.data.data;
          set({ 
            user, 
            token: accessToken, 
            isAuthenticated: true, 
            isLoading: false 
          });
          return response.data;
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register', userData);
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }));
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'indipips-auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
);

export default useAuthStore;
