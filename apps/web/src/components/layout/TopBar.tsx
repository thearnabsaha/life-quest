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
        'fixed top-0 right-0 z-50 h-14 bg-zinc-950 border-b-2 border-zinc-800',
        'flex items-center justify-between px-4 md:pr-6 transition-all duration-200',
        'left-0',
        isExpanded ? 'md:left-60' : 'md:left-16'
      )}
    >
      <h1 className="font-heading text-neonGreen text-sm md:text-base tracking-wider">
        LIFE QUEST
      </h1>

      <div className="flex items-center gap-3 md:gap-5">
        {/* Quick XP display */}
        <Link
          href="/xp"
          className="flex items-center gap-1.5 px-2.5 py-1 border-2 border-neonGreen bg-neonGreen/5 hover:bg-neonGreen/10 transition-colors"
        >
          <Zap className="w-3 h-3 text-neonGreen" strokeWidth={2.5} />
          <span className="font-heading text-xs text-neonGreen">
            {xp.toLocaleString()}
          </span>
        </Link>

        {/* Notification bell */}
        <Link
          href="/notifications"
          className="relative p-2 border-2 border-zinc-600 hover:border-neonPink hover:text-neonPink transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-neonPink border border-black text-black font-mono text-[8px]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Rank badge */}
        <Link
          href="/profile"
          className="w-8 h-8 flex items-center justify-center border-2 border-neonBlue bg-neonBlue/10 text-neonBlue font-heading text-xs hover:bg-neonBlue/20 transition-colors"
          aria-label="Profile"
        >
          {rankLetter}
        </Link>
      </div>
    </header>
  );
}
