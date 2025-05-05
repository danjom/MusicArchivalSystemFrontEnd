import { writable } from 'svelte/store';
import type { UserData } from '../types/auth';

interface AuthState {
  user: UserData | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

const createAuthStore = () => {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  });

  let currentState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  };

  subscribe((state) => {
    currentState = state;
  });

  return {
    subscribe,
    get accessToken() {
      return currentState.accessToken;
    },
    get refreshToken() {
      return currentState.refreshToken;
    },
    setTokens: (accessToken: string, refreshToken: string) => {
      update((state) => ({
        ...state,
        accessToken,
        refreshToken,
        isAuthenticated: true,
      }));
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    },
    setUser: (user: UserData) => {
      update((state) => ({
        ...state,
        user,
      }));
    },
    logout: () => {
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    initialize: () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      if (accessToken && refreshToken) {
        update((state) => ({
          ...state,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }));
      }
    },
  };
};

export const authStore = createAuthStore();