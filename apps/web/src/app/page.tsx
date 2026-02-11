'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import {
  ProfileCard,
  StatsOverview,
} from '@/components/profile';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { useXPStore } from '@/stores/useXPStore';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { useHabitStore } from '@/stores/useHabitStore';
import { useCalendarStore } from '@/stores/useCalendarStore';
import { useGoalStore } from '@/stores/useGoalStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
// Direct store references for batch hydration (no re-render subscription needed)
import { formatDate } from '@life-quest/utils';
import type { Profile } from '@life-quest/types';
import {
  Zap,
  CheckSquare,
  Calendar,
  Target,
  BookOpen,
  Bell,
  X,
  Radar,
  ShoppingBag,
  ChevronRight,
  TrendingUp,
  Flame,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const NEON_COLORS: Record<string, string> = {
  neonGreen: '#39ff14',
  neonPink: '#ff2d95',
  neonBlue: '#00d4ff',
  neonYellow: '#ffe600',
  neonPurple: '#bf00ff',
};

function getCurrentStreak(
  profile: Profile | null,
  habits: { streak: number }[]
): number {
  if (!habits.length) return 0;
  return Math.max(0, ...habits.map((h) => h.streak));
}

// Animated XP counter
function AnimatedXPCounter({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const start = displayed;
    const end = value;
    const duration = 800;
    const startTime = Date.now();

    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(start + (end - start) * eased);
      setDisplayed(current);
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    }

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [value]);

  return <span>{displayed.toLocaleString()}</span>;
}

function MiniCalendarHeatmap({
  entries,
}: {
  entries: { date: string; totalXP: number }[];
}) {
  const entryMap = new Map(
    entries.map((e) => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return [key, e.totalXP];
    })
  );

  const maxXP = Math.max(1, ...entries.map((e) => e.totalXP));

  const days: { date: string; xp: number }[] = [];
  const now = new Date();
  for (let i = 34; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = formatDate(d);
    const xp = entryMap.get(key) ?? 0;
    days.push({ date: key, xp });
  }

  return (
    <div className="flex flex-wrap gap-0.5">
      {days.map(({ date, xp }) => {
        const intensity = xp > 0 ? Math.min(1, xp / maxXP) : 0;
        const bg =
          intensity === 0
            ? 'bg-zinc-800'
            : intensity < 0.25
              ? 'bg-neonGreen/30'
              : intensity < 0.5
                ? 'bg-neonGreen/60'
                : intensity < 0.75
                  ? 'bg-neonGreen/80'
                  : 'bg-neonGreen';
        return (
          <div
            key={date}
            className={`w-2 h-2 border border-zinc-700 ${bg}`}
            title={`${date}: ${xp} XP`}
          />
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();
  const { logs, fetchLogs } = useXPStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { habits, fetchHabits } = useHabitStore();
  const { entries, fetchCalendar } = useCalendarStore();
  const { goals, fetchGoals } = useGoalStore();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
  } = useNotificationStore();

  const [dashLoaded, setDashLoaded] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (dashLoaded) return;

    // Single batch request replaces 8 individual API calls
    const token = useAuthStore.getState().token;
    const year = new Date().getFullYear();
    fetch(`/api/dashboard?year=${year}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        // Hydrate all stores from the single response
        if (data.profile) {
          useProfileStore.setState({ profile: data.profile, _lastFetch: Date.now(), isLoading: false });
        }
        if (data.xpLogs) {
          useXPStore.setState({ logs: data.xpLogs.data, total: data.xpLogs.total, page: data.xpLogs.page, isLoading: false });
        }
        if (data.categories) {
          useCategoryStore.setState({ categories: data.categories, _lastFetch: Date.now(), isLoading: false });
        }
        if (data.habits) {
          useHabitStore.setState({ habits: data.habits, _lastFetch: Date.now(), isLoading: false });
        }
        if (data.calendar) {
          useCalendarStore.setState({ entries: data.calendar, year, isLoading: false });
        }
        if (data.goals) {
          useGoalStore.setState({ goals: data.goals, _lastFetch: Date.now(), isLoading: false });
        }
        if (data.notifications) {
          useNotificationStore.setState({ notifications: data.notifications, isLoading: false });
        }
        if (data.unreadCount !== undefined) {
          useNotificationStore.setState({ unreadCount: data.unreadCount, _lastCountFetch: Date.now() });
        }
        setDashLoaded(true);
      })
      .catch(() => {
        // Fallback: fetch individually if batch fails
        fetchProfile(true);
        fetchLogs(1);
        fetchCategories(true);
        fetchHabits(true);
        fetchCalendar();
        fetchGoals(true);
        fetchNotifications(20);
        fetchUnreadCount();
        setDashLoaded(true);
      });
  }, [
    user,
    isInitialized,
    router,
    dashLoaded,
    fetchProfile,
    fetchLogs,
    fetchCategories,
    fetchHabits,
    fetchCalendar,
    fetchGoals,
    fetchNotifications,
    fetchUnreadCount,
  ]);

  const categoryXP = useMemo(() => {
    const map: Record<string, number> = {};
    for (const log of logs) {
      const cid = log.categoryId ?? 'uncategorized';
      map[cid] = (map[cid] ?? 0) + log.amount;
    }
    return map;
  }, [logs]);

  const categoriesWithXP = useMemo(() => {
    return categories.map((c) => ({
      ...c,
      totalXP: categoryXP[c.id] ?? 0,
    }));
  }, [categories, categoryXP]);

  const activeGoals = useMemo(
    () => goals.filter((g) => g.status === 'ACTIVE').slice(0, 3),
    [goals]
  );

  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.read).slice(0, 3),
    [notifications]
  );

  if (!isInitialized || !user) return null;

  const activeHabits = habits.filter((h) => h.isActive);
  const todayHabits = activeHabits.slice(0, 5);
  const currentStreak = getCurrentStreak(profile, habits);

  const cardClass =
    'border-2 border-zinc-700 bg-zinc-900 p-5 transition-all hover:border-zinc-500';
  const sectionTitle = 'font-heading text-xs uppercase tracking-wider mb-4';

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Profile Card */}
        {profile ? (
          <ProfileCard profile={profile} />
        ) : (
          <div className="border-2 border-zinc-700 bg-zinc-900 p-8 text-center animate-pulse">
            <p className="font-body text-zinc-500">Loading profile...</p>
          </div>
        )}

        {/* Quick Actions - cleaner grid */}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {[
            { href: '/xp', icon: Zap, label: 'Log XP', color: '#39ff14' },
            { href: '/habits', icon: CheckSquare, label: 'Habits', color: '#ffe600' },
            { href: '/goals', icon: Target, label: 'Challenges', color: '#00d4ff' },
            { href: '/radar', icon: Radar, label: 'Stats', color: '#bf00ff' },
            { href: '/shop', icon: ShoppingBag, label: 'Shop', color: '#ff2d95' },
            { href: '/rulebook', icon: BookOpen, label: 'Rules', color: '#ffe600' },
          ].map(({ href, icon: Icon, label, color }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 border-2 border-zinc-700 bg-zinc-900 p-4 transition-all hover:border-opacity-80"
              style={{ '--hover-color': color } as React.CSSProperties}
            >
              <Icon className="h-6 w-6" style={{ color }} strokeWidth={2} />
              <span className="font-body text-[10px] text-zinc-400">{label}</span>
            </Link>
          ))}
        </div>

        {/* Categories Overview */}
        <div className={cardClass}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className={`${sectionTitle} text-neonGreen mb-0`}>CATEGORIES</h2>
            <Link href="/categories" className="font-body text-xs text-neonGreen hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categoriesWithXP.length === 0 ? (
              <p className="col-span-full font-body text-sm text-zinc-500">
                No categories yet.
              </p>
            ) : (
              categoriesWithXP.map((cat) => {
                const hexColor =
                  cat.color && NEON_COLORS[cat.color]
                    ? NEON_COLORS[cat.color]
                    : NEON_COLORS.neonGreen;
                return (
                  <Link
                    key={cat.id}
                    href="/categories"
                    className="flex flex-col gap-1 border-2 border-zinc-800 bg-zinc-950 p-3 transition-all hover:bg-zinc-900"
                    style={{ borderLeftColor: hexColor, borderLeftWidth: 3 }}
                  >
                    <span className="text-lg">{cat.icon || '📁'}</span>
                    <span className="font-body text-sm font-medium text-white">
                      {cat.name}
                    </span>
                    <span className="font-mono text-xs" style={{ color: hexColor }}>
                      {cat.totalXP.toLocaleString()} XP
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* 2-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Quick Stats */}
            {profile && (
              <div className={cardClass}>
                <h2 className={`${sectionTitle} text-neonGreen`}>QUICK STATS</h2>
                <StatsOverview
                  totalXP={profile.totalXP}
                  level={profile.level}
                  rank={profile.rank}
                  habitsActive={activeHabits.length}
                  categoriesCount={categories.length}
                  currentStreak={currentStreak}
                />
              </div>
            )}

            {/* Recent XP */}
            <div className={cardClass}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`${sectionTitle} text-neonBlue mb-0`}>RECENT XP</h2>
                <Link href="/xp" className="font-body text-xs text-neonBlue hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="font-body text-sm text-zinc-500">No XP logged yet.</p>
                ) : (
                  logs.slice(0, 8).map((log) => (
                    <div key={log.id} className="flex items-center justify-between border-b border-zinc-800 pb-2 last:border-0">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3 text-neonGreen" />
                        <span className="font-mono text-sm text-neonGreen">+{log.amount}</span>
                        {log.source && (
                          <span className="font-body text-xs text-zinc-500 truncate max-w-[120px]">{log.source}</span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-zinc-600">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Challenges */}
            <div className={cardClass}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className={`${sectionTitle} text-neonYellow mb-0`}>CHALLENGES</h2>
                <Link href="/goals" className="font-body text-xs text-neonYellow hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              {activeGoals.length === 0 ? (
                <p className="font-body text-sm text-zinc-500">No active challenges.</p>
              ) : (
                <div className="space-y-3">
                  {activeGoals.map((goal) => {
                    const pct = goal.targetValue > 0 ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) : 0;
                    return (
                      <div key={goal.id} className="border border-zinc-800 bg-zinc-950 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-body text-sm text-white">{goal.title}</span>
                          <span className="font-mono text-xs text-neonGreen">{pct}%</span>
                        </div>
                        <div className="h-1.5 border border-zinc-700 bg-zinc-800">
                          <motion.div
                            className="h-full bg-neonGreen"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Today's Habits */}
            <div className={cardClass}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`${sectionTitle} text-neonYellow mb-0`}>TODAY&apos;S HABITS</h2>
                <Link href="/habits" className="font-body text-xs text-neonYellow hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {todayHabits.length === 0 ? (
                  <p className="font-body text-sm text-zinc-500">No habits yet.</p>
                ) : (
                  todayHabits.map((habit) => (
                    <div key={habit.id} className="flex items-center justify-between border border-zinc-800 p-3 bg-zinc-950">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-3 h-3 text-neonGreen" />
                        <span className="font-body text-sm text-white">{habit.name}</span>
                        <span className="font-mono text-xs text-neonGreen">+{habit.xpReward}</span>
                      </div>
                      {habit.streak > 0 && (
                        <span className="font-mono text-xs text-neonYellow flex items-center gap-1">
                          <Flame className="w-3 h-3" /> {habit.streak}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Activity Heatmap */}
            <div className={cardClass}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`${sectionTitle} text-neonPurple mb-0`}>ACTIVITY</h2>
                <Link href="/calendar" className="font-body text-xs text-neonPurple hover:underline flex items-center gap-1">
                  Full calendar <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-3 h-3 text-neonPurple" />
                <span className="font-body text-[10px] text-zinc-500">Last 35 days</span>
              </div>
              <MiniCalendarHeatmap
                entries={entries.map((e) => ({
                  date: typeof e.date === 'string' ? e.date.split('T')[0] : formatDate(e.date),
                  totalXP: e.totalXP,
                }))}
              />
            </div>

            {/* Notifications */}
            <div className={cardClass}>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-3 h-3 text-neonPink" />
                  <h2 className={`${sectionTitle} text-neonPink mb-0`}>NOTIFICATIONS</h2>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 border border-neonPink bg-neonPink font-mono text-[9px] text-black">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <Link href="/notifications" className="font-body text-xs text-neonPink hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {unreadNotifications.length === 0 ? (
                  <p className="font-body text-sm text-zinc-500">No unread notifications.</p>
                ) : (
                  unreadNotifications.map((n) => (
                    <div key={n.id} className="flex items-start justify-between gap-2 border border-zinc-800 bg-zinc-950 p-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-body text-sm font-medium text-white">{n.title}</p>
                        <p className="font-body text-xs text-zinc-400 line-clamp-1">{n.message}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => markAsRead(n.id)}
                        aria-label="Dismiss"
                        className="shrink-0 border border-zinc-700 p-1 text-zinc-500 hover:text-neonPink hover:border-neonPink transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* XP Balance Widget */}
            {profile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-2 border-neonGreen bg-zinc-900 p-5 shadow-[4px_4px_0px_0px_#39ff14]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-body text-xs uppercase tracking-wider text-zinc-400">
                      XP Balance
                    </p>
                    <p className="font-heading text-3xl text-neonGreen mt-1">
                      <AnimatedXPCounter value={profile.totalXP} />
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-neonBlue" />
                      <span className="font-mono text-xs text-neonBlue">Lv {profile.level}</span>
                    </div>
                    <span className="font-heading text-xs text-neonPurple">{profile.rank}-RANK</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
