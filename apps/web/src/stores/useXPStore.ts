import { create } from 'zustand';
import type { XPLog, XPType } from '@life-quest/types';
import api from '@/lib/api';

interface XPLogsResponse {
  data: XPLog[];
  total: number;
  page: number;
  limit: number;
}

interface XPState {
  logs: XPLog[];
  total: number;
  page: number;
  isLoading: boolean;
  fetchLogs: (page?: number, limit?: number) => Promise<void>;
  logXP: (
    amount: number,
    type: XPType,
    categoryId?: string,
    source?: string
  ) => Promise<void>;
}

export const useXPStore = create<XPState>((set, get) => ({
  logs: [],
  total: 0,
  page: 1,
  isLoading: false,

  fetchLogs: async (page = 1, limit = 20) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get<XPLogsResponse>('/xp/logs', {
        params: { page, limit },
      });
      set({
        logs: data.data,
        total: data.total,
        page: data.page,
        isLoading: false,
      });
    } catch {
      set({
        logs: [],
        total: 0,
        page: 1,
        isLoading: false,
      });
    }
  },

  logXP: async (
    amount: number,
    type: XPType,
    categoryId?: string,
    source?: string
  ) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<XPLog>('/xp/log', {
        amount,
        type,
        ...(categoryId && { categoryId }),
        ...(source && { source }),
      });
      set((s) => ({
        logs: [data, ...s.logs],
        total: s.total + 1,
        isLoading: false,
      }));
    } catch {
      set((s) => ({ isLoading: false }));
      throw new Error('Failed to log XP');
    }
  },
}));
