'use client';

import { useEffect } from 'react';
import { Bell, Zap } from 'lucide-react';
import Link from 'next/link';
import { useSidebar } from './SidebarContext';
import { useProfileStore } from '@/stores/useProfileStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import clsx from 'clsx';

export function TopBar() {
  const { isExpanded } = useSidebar();
  const { profile, fetchProfile } = useProfileStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    fetchProfile();
    fetchUnreadCount();
  }, [fetchProfile, fetchUnreadCount]);

  const xp = profile?.totalXP ?? 0;
  const rankLetter = profile?.rank ?? '?';

  return (
    <header
      className={clsx(
        'fixed top-0 right-0 z-50 h-14 border-b-2 theme-transition',
        'flex items-center justify-between px-4 md:pr-6 transition-all duration-300',
        'left-0',
        isExpanded ? 'md:left-60' : 'md:left-16'
      )}
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <h1 className="font-heading text-sm md:text-base tracking-wider animate-text-shimmer">
        LIFE QUEST
      </h1>

      <div className="flex items-center gap-3 md:gap-5">
        {/* Quick XP display */}
        <Link
          href="/xp"
          className="flex items-center gap-1.5 px-2.5 py-1 border-2 transition-colors"
          style={{
            borderColor: 'var(--color-accent)',
            backgroundColor: 'color-mix(in srgb, var(--color-accent) 5%, transparent)',
          }}
        >
          <Zap className="w-3 h-3" style={{ color: 'var(--color-accent)' }} strokeWidth={2.5} />
          <span className="font-heading text-xs" style={{ color: 'var(--color-accent)' }}>
            {xp.toLocaleString()}
          </span>
        </Link>

        {/* Notification bell */}
        <Link
          href="/notifications"
          className="relative p-2 border-2 transition-colors hover:shadow-glow-sm"
          style={{ borderColor: 'var(--color-border-subtle)' }}
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} strokeWidth={2} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center border border-black font-mono text-[8px] text-black"
              style={{ backgroundColor: 'var(--color-accent-2)' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Rank badge */}
        <Link
          href="/profile"
          className="w-8 h-8 flex items-center justify-center border-2 font-heading text-xs transition-colors hover:shadow-glow-sm"
          style={{
            borderColor: 'var(--color-accent-2)',
            backgroundColor: 'color-mix(in srgb, var(--color-accent-2) 10%, transparent)',
            color: 'var(--color-accent-2)',
          }}
          aria-label="Profile"
        >
          {rankLetter}
        </Link>
      </div>
    </header>
  );
}
