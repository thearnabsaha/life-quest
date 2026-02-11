import { create } from 'zustand';
import type { Goal, GoalType, GoalStatus } from '@life-quest/types';
import api from '@/lib/api';

export interface CreateGoalData {
  title: string;
  description?: string | null;
  type: GoalType;
  targetValue: number;
  xpReward: number;
  categoryId?: string | null;
  deadline?: string | null;
}

export interface UpdateGoalData {
  title?: string;
  description?: string | null;
  type?: GoalType;
  status?: GoalStatus;
  categoryId?: string | null;
  targetValue?: number;
  currentValue?: number;
  xpReward?: number;
  deadline?: string | null;
}

interface GoalState {
  goals: Goal[];
  isLoading: boolean;
  _lastFetch: number;
  fetchGoals: (force?: boolean) => Promise<void>;
  createGoal: (data: CreateGoalData) => Promise<Goal>;
  updateGoal: (id: string, data: UpdateGoalData) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateProgress: (id: string, increment: number) => Promise<void>;
}

const STALE_MS = 10_000;

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  isLoading: false,
  _lastFetch: 0,

  fetchGoals: async (force) => {
    const now = Date.now();
    const state = get();
    if (!force && state.goals.length > 0 && now - state._lastFetch < STALE_MS) return;
    if (state.isLoading) return;
    set({ isLoading: true });
    try {
      const { data } = await api.get<Goal[]>('/goals');
      set({ goals: data, isLoading: false, _lastFetch: Date.now() });
    } catch {
      set({ goals: [], isLoading: false });
    }
  },

  createGoal: async (createData: CreateGoalData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<Goal>('/goals', createData);
      set((s) => ({
        goals: [data, ...s.goals],
        isLoading: false,
      }));
      return data;
    } catch {
      set((s) => ({ isLoading: false }));
      throw new Error('Failed to create goal');
    }
  },

  updateGoal: async (id: string, updateData: UpdateGoalData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.patch<Goal>(`/goals/${id}`, updateData);
      set((s) => ({
        goals: s.goals.map((g) => (g.id === id ? data : g)),
        isLoading: false,
      }));
    } catch {
      set((s) => ({ isLoading: false }));
      throw new Error('Failed to update goal');
    }
  },

  deleteGoal: async (id: string) => {
    set({ isLoading: true });
    try {
      await api.delete(`/goals/${id}`);
      set((s) => ({
        goals: s.goals.filter((g) => g.id !== id),
        isLoading: false,
      }));
    } catch {
      set((s) => ({ isLoading: false }));
      throw new Error('Failed to delete goal');
    }
  },

  updateProgress: async (id: string, increment: number) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<Goal>(`/goals/${id}/progress`, {
        increment,
      });
      set((s) => ({
        goals: s.goals.map((g) => (g.id === id ? data : g)),
        isLoading: false,
      }));
    } catch {
      set((s) => ({ isLoading: false }));
      throw new Error('Failed to update progress');
    }
  },
}));
