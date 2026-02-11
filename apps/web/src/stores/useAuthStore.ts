import { create } from 'zustand';
import type { User, AuthResponse } from '@life-quest/types';
import api from '@/lib/api';
import { getToken, setToken, removeToken } from '@/lib/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
      setToken(data.token);
      set({
        user: data.user,
        token: data.token,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
            'Login failed'
          : 'Login failed';
      set({
        error: message,
        isLoading: false,
        user: null,
        token: null,
      });
      throw err;
    }
  },

  register: async (email: string, password: string, displayName: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', {
        email,
        password,
        displayName,
      });
      setToken(data.token);
      set({
        user: data.user,
        token: data.token,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
            'Registration failed'
          : 'Registration failed';
      set({
        error: message,
        isLoading: false,
        user: null,
        token: null,
      });
      throw err;
    }
  },

  logout: () => {
    removeToken();
    set({
      user: null,
      token: null,
      error: null,
    });
  },

  loadUser: async () => {
    const token = getToken();
    if (!token) {
      set({ isInitialized: true });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<User>('/auth/me');
      set({
        user: data,
        token,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    } catch {
      removeToken();
      set({
        user: null,
        token: null,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
