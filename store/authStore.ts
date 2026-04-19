import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  email: string;
  nickname: string;
  phone?: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser | null, token: string) => void;
  clearAuth: () => void;
  mockLogin: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem('accessToken', token);
        set({ user, accessToken: token, isAuthenticated: true });
      },

      clearAuth: () => {
        localStorage.removeItem('accessToken');
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      mockLogin: () => {
        const mockToken = 'mock-access-token';
        localStorage.setItem('accessToken', mockToken);

        set({
          user: {
            email: 'demo@momentix.com',
            nickname: '테스트유저',
            phone: '010-0000-0000',
          },
          accessToken: mockToken,
          isAuthenticated: true,
        });
      },
    }),
    {
      name: 'momentix-auth',
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);