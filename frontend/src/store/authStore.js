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

      login: async (email, password, rememberMe = true) => {
        set({ loading: true, error: null });
        try {
          const credentials = { email, password };
          const { data } = await authAPI.login(credentials);
          if (rememberMe) {
            localStorage.setItem('token', data.token);
          } else {
            sessionStorage.setItem('token', data.token);
          }
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            loading: false
          });
          return { success: true };
        } catch (error) {
          const status = error.response?.status;
          const rawMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Login failed';
          const normalizedMessage =
            status === 429 ||
            String(rawMessage).toLowerCase().includes('too many requests') ||
            String(rawMessage).toLowerCase().includes('rate limit')
              ? 'طلبات كثيرة جدًا. من فضلك انتظر قليلًا ثم حاول مرة أخرى.'
              : rawMessage;
          set({ loading: false, error: normalizedMessage });
          return { success: false, error: normalizedMessage };
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const { data } = await authAPI.register(userData);
          localStorage.setItem('token', data.token);
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            loading: false
          });
          return { success: true };
        } catch (error) {
          const status = error.response?.status;
          const rawMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Registration failed';
          const normalizedMessage =
            status === 429 ||
            String(rawMessage).toLowerCase().includes('too many requests') ||
            String(rawMessage).toLowerCase().includes('rate limit')
              ? 'طلبات كثيرة جدًا. من فضلك انتظر قليلًا ثم حاول مرة أخرى.'
              : rawMessage;
          set({ loading: false, error: normalizedMessage });
          return { success: false, error: normalizedMessage };
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
      },

      fetchUser: async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          set({ loading: false });
          return;
        }

        set({ loading: true });
        try {
          const { data } = await authAPI.getMe();
          set({
            user: data.user,
            token,
            isAuthenticated: true,
            loading: false
          });
        } catch (error) {
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