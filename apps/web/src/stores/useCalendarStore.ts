import { create } from 'zustand';
import type { CalendarEntry } from '@life-quest/types';
import api from '@/lib/api';

interface CalendarState {
  entries: CalendarEntry[];
  year: number;
  isLoading: boolean;
  fetchCalendar: (year?: number) => Promise<void>;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  entries: [],
  year: new Date().getFullYear(),
  isLoading: false,

  fetchCalendar: async (year?: number) => {
    const targetYear = year ?? new Date().getFullYear();
    set({ isLoading: true, year: targetYear });
    try {
      const { data } = await api.get<CalendarEntry[]>('/calendar', {
        params: { year: targetYear },
      });
      set({ entries: data, isLoading: false });
    } catch {
      set({ entries: [], isLoading: false });
    }
  },
}));
