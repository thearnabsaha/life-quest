import { create } from 'zustand';
import type { RulebookConfig } from '@life-quest/types';
import api from '@/lib/api';

export interface UpdateRulebookData {
  mode?: 'AUTO' | 'MANUAL';
  xpLevelFormula?: string;
  levelRankMap?: Record<string, string>;
  rankTitles?: Record<string, string>;
  artifactThresholds?: Record<string, string>;
  statMultipliers?: Record<string, number>;
}

interface RulebookState {
  config: RulebookConfig | null;
  isLoading: boolean;
  fetchRulebook: () => Promise<void>;
  updateRulebook: (data: UpdateRulebookData) => Promise<void>;
  resetRulebook: () => Promise<void>;
}

export const useRulebookStore = create<RulebookState>((set, get) => ({
  config: null,
  isLoading: false,

  fetchRulebook: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get<RulebookConfig>('/rulebook');
      set({ config: data, isLoading: false });
    } catch {
      set({ config: null, isLoading: false });
    }
  },

  updateRulebook: async (updateData: UpdateRulebookData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.patch<RulebookConfig>('/rulebook', updateData);
      set({ config: data, isLoading: false });
    } catch {
      set((s) => ({ isLoading: false }));
      throw new Error('Failed to update rulebook');
    }
  },

  resetRulebook: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<RulebookConfig>('/rulebook/reset');
      set({ config: data, isLoading: false });
    } catch {
      set((s) => ({ isLoading: false }));
      throw new Error('Failed to reset rulebook');
    }
  },
}));
