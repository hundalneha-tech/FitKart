import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api';

interface AuthState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setToken: (token: string) => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setToken: (token: string) => {
        apiClient.setToken(token);
        set({ token, isAuthenticated: true });
      },

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const response = await apiClient.login(email, password);
          const { accessToken, refreshToken, user } = response.data;

          apiClient.setToken(accessToken);
          set({
            token: accessToken,
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          // Store refresh token securely
          localStorage.setItem('refreshToken', refreshToken);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await apiClient.logout();
        } catch (error) {
          console.error('Logout failed:', error);
        } finally {
          apiClient.clearToken();
          localStorage.removeItem('refreshToken');
          set({
            token: null,
            user: null,
            isAuthenticated: false,
          });
        }
      },

      loadUser: async () => {
        try {
          set({ isLoading: true });
          const response = await apiClient.getProfile();
          set({
            user: response.data,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
