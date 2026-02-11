import { create } from 'zustand';
import type { Profile } from '@life-quest/types';
import api from '@/lib/api';

export interface UpdateProfileData {
  displayName?: string;
  manualLevelOverride?: number | null;
  manualXPOverride?: number | null;
}

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  _lastFetch: number;
  fetchProfile: (force?: boolean) => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  resetProfile: () => Promise<void>;
}

const STALE_MS = 10_000; // 10 seconds

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  _lastFetch: 0,

  fetchProfile: async (force) => {
    const now = Date.now();
    const state = get();
    if (!force && state.profile && now - state._lastFetch < STALE_MS) return;
    if (state.isLoading) return;
    set({ isLoading: true });
    try {
      const { data } = await api.get<Profile>('/profile');
      set({ profile: data, isLoading: false, _lastFetch: Date.now() });
    } catch {
      set({ isLoading: false });
    }
  },

  updateProfile: async (updateData: UpdateProfileData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.patch<Profile>('/profile', updateData);
      set({ profile: data, isLoading: false, _lastFetch: Date.now() });
    } catch {
      set(() => ({ isLoading: false }));
      throw new Error('Failed to update profile');
    }
  },

  resetProfile: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<Profile>('/profile/reset');
      set({ profile: data, isLoading: false, _lastFetch: Date.now() });
    } catch {
      set(() => ({ isLoading: false }));
      throw new Error('Failed to reset profile');
    }
  },
}));
