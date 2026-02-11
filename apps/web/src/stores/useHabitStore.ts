import { create } from 'zustand';
import type { Habit, HabitType } from '@life-quest/types';
import api from '@/lib/api';
import { refreshAfterXP } from './refreshStores';
import { showToast } from './useToastStore';

export interface CreateHabitData {
  name: string;
  type: HabitType;
  xpReward?: number;
  categoryId?: string | null;
  subCategoryId?: string | null;
  comment?: string | null;
}

export interface UpdateHabitData {
  name?: string;
  type?: HabitType;
  xpReward?: number;
  isActive?: boolean;
  categoryId?: string | null;
  subCategoryId?: string | null;
  comment?: string | null;
}

interface HabitState {
  habits: Habit[];
  isLoading: boolean;
  _lastFetch: number;
  fetchHabits: (force?: boolean) => Promise<void>;
  createHabit: (data: CreateHabitData) => Promise<Habit>;
  updateHabit: (id: string, data: UpdateHabitData) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  completeHabit: (
    id: string,
    date: string,
    hoursLogged?: number
  ) => Promise<void>;
  uncompleteHabit: (id: string, date: string) => Promise<void>;
}

const STALE_MS = 10_000;

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  isLoading: false,
  _lastFetch: 0,

  fetchHabits: async (force) => {
    const now = Date.now();
    const state = get();
    if (!force && state.habits.length > 0 && now - state._lastFetch < STALE_MS) return;
    if (state.isLoading) return;
    set({ isLoading: true });
    try {
      const { data } = await api.get<Habit[]>('/habits');
      set({ habits: data, isLoading: false, _lastFetch: Date.now() });
    } catch {
      set({ habits: [], isLoading: false });
    }
  },

  createHabit: async (createData: CreateHabitData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<Habit>('/habits', createData);
      set((s) => ({
        habits: [...s.habits, data],
        isLoading: false,
      }));
      return data;
    } catch {
      set((s) => ({ isLoading: false }));
      showToast('Failed to create habit');
      throw new Error('Failed to create habit');
    }
  },

  updateHabit: async (id: string, updateData: UpdateHabitData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.patch<Habit>(`/habits/${id}`, updateData);
      set((s) => ({
        habits: s.habits.map((h) => (h.id === id ? data : h)),
        isLoading: false,
      }));
    } catch {
      set((s) => ({ isLoading: false }));
      throw new Error('Failed to update habit');
    }
  },

  deleteHabit: async (id: string) => {
    set({ isLoading: true });
    try {
      await api.delete(`/habits/${id}`);
      set((s) => ({
        habits: s.habits.filter((h) => h.id !== id),
        isLoading: false,
      }));
    } catch {
      set((s) => ({ isLoading: false }));
      throw new Error('Failed to delete habit');
    }
  },

  completeHabit: async (id: string, date: string, hoursLogged?: number) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<Habit>(`/habits/${id}/complete`, {
        date,
        ...(hoursLogged !== undefined && { hoursLogged }),
      });
      set((s) => ({
        habits: s.habits.map((h) => (h.id === id ? data : h)),
        isLoading: false,
      }));
      // Habit completion awards XP → refresh calendar, XP logs, and profile
      refreshAfterXP();
    } catch {
      set((s) => ({ isLoading: false }));
      showToast('Failed to complete habit');
      throw new Error('Failed to complete habit');
    }
  },

  uncompleteHabit: async (id: string, date: string) => {
    set({ isLoading: true });
    try {
      const { data } = await api.delete<Habit>(`/habits/${id}/complete?date=${date}`);
      set((s) => ({
        habits: s.habits.map((h) => (h.id === id ? data : h)),
        isLoading: false,
      }));
      refreshAfterXP();
    } catch {
      set((s) => ({ isLoading: false }));
      throw new Error('Failed to uncomplete habit');
    }
  },
}));
