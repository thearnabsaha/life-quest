import { create } from 'zustand';
import type { ShopItem, RedemptionLog } from '@life-quest/types';
import api from '@/lib/api';

interface ShopState {
  items: ShopItem[];
  history: RedemptionLog[];
  isLoading: boolean;
  fetchItems: () => Promise<void>;
  createItem: (data: Partial<ShopItem>) => Promise<ShopItem>;
  updateItem: (id: string, data: Partial<ShopItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  purchaseItem: (id: string) => Promise<void>;
  refundItem: (id: string) => Promise<void>;
  fetchHistory: () => Promise<void>;
}

export const useShopStore = create<ShopState>((set) => ({
  items: [],
  history: [],
  isLoading: false,

  fetchItems: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get<ShopItem[]>('/shop');
      set({ items: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createItem: async (createData) => {
    const { data } = await api.post<ShopItem>('/shop', createData);
    set((s) => ({ items: [...s.items, data] }));
    return data;
  },

  updateItem: async (id, updateData) => {
    const { data } = await api.patch<ShopItem>(`/shop/${id}`, updateData);
    set((s) => ({ items: s.items.map((i) => (i.id === id ? data : i)) }));
  },

  deleteItem: async (id) => {
    await api.delete(`/shop/${id}`);
    set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
  },

  purchaseItem: async (id) => {
    const { data } = await api.post<{ item: ShopItem; log: RedemptionLog }>(`/shop/${id}/purchase`);
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? data.item : i)),
      history: [data.log, ...s.history],
    }));
  },

  refundItem: async (id) => {
    const { data } = await api.post<{ item: ShopItem; log: RedemptionLog }>(`/shop/${id}/refund`);
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? data.item : i)),
      history: [data.log, ...s.history],
    }));
  },

  fetchHistory: async () => {
    const { data } = await api.get<RedemptionLog[]>('/shop/history');
    set({ history: data });
  },
}));
