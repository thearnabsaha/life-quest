import { create } from 'zustand';
import type { Notification } from '@life-quest/types';
import api from '@/lib/api';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  _lastCountFetch: number;
  fetchNotifications: (limit?: number) => Promise<void>;
  fetchUnreadCount: (force?: boolean) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const STALE_MS = 15_000; // 15 seconds

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  _lastCountFetch: 0,

  fetchNotifications: async (limit?: number) => {
    if (get().isLoading) return;
    set({ isLoading: true });
    try {
      const url = limit ? `/notifications?limit=${limit}` : '/notifications';
      const { data } = await api.get<Notification[]>(url);
      set({ notifications: data, isLoading: false });
    } catch {
      set({ notifications: [], isLoading: false });
    }
  },

  fetchUnreadCount: async (force) => {
    const now = Date.now();
    if (!force && now - get()._lastCountFetch < STALE_MS) return;
    try {
      const { data } = await api.get<{ count: number }>('/notifications/unread-count');
      set({ unreadCount: data.count, _lastCountFetch: Date.now() });
    } catch {
      set({ unreadCount: 0 });
    }
  },

  markAsRead: async (id: string) => {
    try {
      const wasUnread = get().notifications.find((n) => n.id === id)?.read === false;
      const { data } = await api.patch<Notification>(`/notifications/${id}/read`);
      set((s) => ({
        notifications: s.notifications.map((n) => (n.id === id ? data : n)),
        unreadCount: wasUnread ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
      }));
    } catch {
      // Ignore on error
    }
  },

  markAllAsRead: async () => {
    try {
      await api.post('/notifications/mark-all-read');
      set((s) => ({
        notifications: s.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch {
      // Ignore on error
    }
  },
}));
