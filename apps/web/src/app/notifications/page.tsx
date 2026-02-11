'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { Bell, X, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    isLoading,
  } = useNotificationStore();

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    fetchNotifications();
  }, [user, isInitialized, router, fetchNotifications]);

  if (!isInitialized || !user) return null;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-heading text-xl md:text-2xl text-neonPink">
            NOTIFICATIONS
          </h1>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              className="flex items-center gap-2 border-2 border-neonPink bg-zinc-900 px-4 py-2 font-body text-sm font-semibold text-neonPink transition-colors hover:bg-neonPink hover:text-black"
            >
              <CheckCheck className="w-4 h-4" strokeWidth={2} />
              Mark all read
            </button>
          )}
        </div>

        {isLoading && notifications.length === 0 ? (
          <div className="border-2 border-white bg-zinc-900 p-12 text-center">
            <p className="font-body text-zinc-400">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="border-2 border-white bg-zinc-900 p-12 text-center">
            <Bell className="mx-auto mb-4 h-12 w-12 text-zinc-600" strokeWidth={2} />
            <p className="font-body text-zinc-400">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start justify-between gap-4 border-2 border-white p-4 ${
                  n.read ? 'bg-zinc-950 opacity-80' : 'bg-zinc-900'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-body text-sm font-semibold text-white">
                    {n.title}
                  </p>
                  <p className="font-body text-sm text-zinc-400">
                    {n.message}
                  </p>
                  <p className="mt-2 font-mono text-xs text-zinc-500">
                    {formatDate(n.createdAt)}
                  </p>
                </div>
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => markAsRead(n.id)}
                    aria-label="Mark as read"
                    className="shrink-0 border-2 border-neonPink p-2 text-neonPink transition-colors hover:bg-neonPink hover:text-black"
                  >
                    <X className="h-4 w-4" strokeWidth={2} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
