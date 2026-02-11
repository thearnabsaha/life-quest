import { create } from 'zustand';
import type { RadarStat } from '@life-quest/types';
import api from '@/lib/api';

type TimeRange = 'week' | 'month' | 'all';

export interface SubCategoryRadarStat {
  subCategoryId: string;
  subCategoryName: string;
  categoryId: string;
  totalXP: number;
  level: number;
  streak: number;
  last7DaysXP: number;
  last30DaysXP: number;
  habitCount: number;
}

export interface CategoryWithSubRadar {
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  categoryColor: string | null;
  subCategories: SubCategoryRadarStat[];
}

interface RadarState {
  stats: RadarStat[];
  subCategoryRadar: CategoryWithSubRadar[];
  timeRange: TimeRange;
  isLoading: boolean;
  isLoadingSubs: boolean;
  setTimeRange: (range: TimeRange) => void;
  fetchStats: (range?: TimeRange) => Promise<void>;
  fetchSubCategoryRadar: () => Promise<void>;
}

export const useRadarStore = create<RadarState>((set, get) => ({
  stats: [],
  subCategoryRadar: [],
  timeRange: 'all',
  isLoading: false,
  isLoadingSubs: false,

  setTimeRange: (range) => {
    set({ timeRange: range });
    get().fetchStats(range);
  },

  fetchStats: async (range) => {
    set({ isLoading: true });
    try {
      const r = range ?? get().timeRange;
      const { data } = await api.get<RadarStat[]>(`/radar?range=${r}`);
      set({ stats: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchSubCategoryRadar: async () => {
    set({ isLoadingSubs: true });
    try {
      const { data } = await api.get<CategoryWithSubRadar[]>('/radar/subcategories');
      set({ subCategoryRadar: data, isLoadingSubs: false });
    } catch {
      set({ isLoadingSubs: false });
    }
  },
}));
