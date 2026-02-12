'use client';

import { useEffect } from 'react';
import { Bell, Zap, Swords } from 'lucide-react';
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
        'fixed top-0 right-0 z-50 border-b theme-transition',
        'flex items-center justify-between transition-all duration-300',
        'left-0',
        /* Mobile: slim 48px bar | Desktop: 56px */
        'h-12 px-3 md:h-14 md:px-4 md:pr-6',
        isExpanded ? 'md:left-60' : 'md:left-16'
      )}
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        borderColor: 'var(--color-border)',
        /* Extend behind the status bar on notched phones */
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      {/* Logo / Title */}
      <Link href="/" className="flex items-center gap-1.5 md:gap-2 group">
        <div
          className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-md border transition-all group-hover:scale-105"
          style={{
            borderColor: 'var(--color-accent)',
            backgroundColor: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
          }}
        >
          <Swords
            className="w-3 h-3 md:w-4 md:h-4"
            style={{ color: 'var(--color-accent)' }}
            strokeWidth={2.5}
          />
        </div>
        <h1 className="font-heading text-[10px] md:text-base tracking-wider animate-text-shimmer">
          LIFE QUEST
        </h1>
      </Link>

      {/* Right controls */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* XP chip */}
        <Link
          href="/xp"
          className="flex items-center gap-1 px-2 py-1 md:px-2.5 rounded-md border transition-colors"
          style={{
            borderColor: 'color-mix(in srgb, var(--color-accent) 40%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--color-accent) 6%, transparent)',
          }}
        >
          <Zap className="w-3 h-3" style={{ color: 'var(--color-accent)' }} strokeWidth={2.5} />
          <span
            className="font-heading text-[10px] md:text-xs tabular-nums"
            style={{ color: 'var(--color-accent)' }}
          >
            {xp.toLocaleString()}
          </span>
        </Link>

        {/* Notification bell */}
        <Link
          href="/notifications"
          className="relative w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-md border transition-colors"
          style={{ borderColor: 'var(--color-border-subtle)' }}
          aria-label="Notifications"
        >
          <Bell
            className="w-[14px] h-[14px] md:w-4 md:h-4"
            style={{ color: 'var(--color-text-primary)' }}
            strokeWidth={2}
          />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 font-mono text-[8px] font-bold text-black"
              style={{ backgroundColor: 'var(--color-accent-2)' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Rank badge */}
        <Link
          href="/profile"
          className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-md border font-heading text-[10px] md:text-xs transition-colors"
          style={{
            borderColor: 'var(--color-accent-2)',
            backgroundColor: 'color-mix(in srgb, var(--color-accent-2) 12%, transparent)',
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
