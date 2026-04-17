import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await authAPI.login({ email, password });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          // Keep legacy token for compatibility
          localStorage.setItem('token', data.accessToken);
          set({
            user: data.user,
            token: data.accessToken,
            isAuthenticated: true,
            loading: false
          });
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.error || 'Login failed';
          set({ loading: false, error: message });
          return { success: false, error: message };
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const { data } = await authAPI.register(userData);
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          // Keep legacy token for compatibility
          localStorage.setItem('token', data.accessToken);
          set({
            user: data.user,
            token: data.accessToken,
            isAuthenticated: true,
            loading: false
          });
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.error || 'Registration failed';
          set({ loading: false, error: message });
          return { success: false, error: message };
        }
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
      },

      fetchUser: async () => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!accessToken && !refreshToken) {
          // Check legacy token
          const legacyToken = localStorage.getItem('token');
          if (!legacyToken) {
            set({ loading: false });
            return;
          }
        }

        set({ loading: true });
        try {
          const { data } = await authAPI.getMe();
          set({
            user: data.user,
            token: localStorage.getItem('accessToken') || localStorage.getItem('token'),
            isAuthenticated: true,
            loading: false
          });
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false
          });
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
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;