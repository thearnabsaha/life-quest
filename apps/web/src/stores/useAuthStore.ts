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

    // Retry up to 2 times for transient server errors
    let lastError: unknown = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const { data } = await api.get<User>('/auth/me');
        set({
          user: data,
          token,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
        return; // success — exit early
      } catch (err: unknown) {
        lastError = err;
        const status =
          err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { status?: number } }).response?.status
            : undefined;

        // Only remove token for definitive auth errors (401)
        if (status === 401) {
          removeToken();
          set({
            user: null,
            token: null,
            isLoading: false,
            isInitialized: true,
            error: null,
          });
          return;
        }

        // For server errors (5xx, 404 for now), retry after a short delay
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
          continue;
        }
      }
    }

    // After all retries failed with non-401 errors, keep the token
    // but set user as null so protected pages show loading/retry
    console.error('[loadUser] All retries failed:', lastError);
    set({
      user: null,
      token: null,
      isLoading: false,
      isInitialized: true,
      error: null,
    });
    // Only remove token if the server consistently says the user doesn't exist
    const status =
      lastError && typeof lastError === 'object' && 'response' in lastError
        ? (lastError as { response?: { status?: number } }).response?.status
        : undefined;
    if (status === 404) {
      // User genuinely not found after 3 attempts — token is stale
      removeToken();
    }
  },

  clearError: () => set({ error: null }),
}));
