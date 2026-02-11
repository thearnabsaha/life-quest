'use client';

import { useEffect, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useCalendarStore } from '@/stores/useCalendarStore';
import { useXPStore } from '@/stores/useXPStore';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { useHabitStore } from '@/stores/useHabitStore';
import { useProfileStore } from '@/stores/useProfileStore';
import {
  BarChart,
  LineChart,
  RadarChart,
  PieChart,
  AreaChart,
  StatStrengthHeatmap,
} from '@/components/analytics';
import { formatDate } from '@life-quest/utils';
import type { XPType } from '@life-quest/types';

const NEON_COLORS: Record<string, string> = {
  MANUAL: '#39ff14',
  AUTO: '#00d4ff',
  BONUS: '#ff2d95',
  STREAK: '#ffe600',
};

function getLast30Days(): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(formatDate(d));
  }
  return dates;
}

export default function AnalyticsPage() {
  const { entries, year, fetchCalendar } = useCalendarStore();
  const { logs, fetchLogs } = useXPStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { habits, fetchHabits } = useHabitStore();
  const { profile, fetchProfile } = useProfileStore();

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    // Force fresh data on every analytics page visit
    fetchCalendar(currentYear);
    fetchLogs(1, 200);
    fetchCategories(true);
    fetchHabits(true);
    fetchProfile(true);
  }, [fetchCalendar, fetchLogs, fetchCategories, fetchHabits, fetchProfile]);

  // 1. Profile Overview - XP over time (last 30 days from calendar entries)
  const xpOverTimeData = useMemo(() => {
    const last30 = getLast30Days();
    const entriesByDate = new Map(entries.map((e) => [e.date, e]));
    return last30.map((date) => ({
      label: new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      value: entriesByDate.get(date)?.totalXP ?? 0,
    }));
  }, [entries]);

  // Level progression bar chart (levels 1 to current with progress)
  const levelProgressionData = useMemo(() => {
    const level = profile?.level ?? 1;
    const totalXP = profile?.totalXP ?? 0;
    const data = [];
    for (let l = 1; l <= Math.min(level, 10); l++) {
      const levelStartXP = (l - 1) ** 2 * 100;
      const levelEndXP = l ** 2 * 100;
      const xpInLevel =
        l < level ? levelEndXP - levelStartXP : totalXP - levelStartXP;
      const maxInLevel = levelEndXP - levelStartXP;
      data.push({
        label: `Lv${l}`,
        value: Math.min(xpInLevel, maxInLevel),
        color: l === level ? '#39ff14' : '#00d4ff',
      });
    }
    return data;
  }, [profile]);

  // Total stats pie - XP by type from logs
  const xpByTypeData = useMemo(() => {
    const byType: Record<XPType, number> = {
      MANUAL: 0,
      AUTO: 0,
      BONUS: 0,
      STREAK: 0,
    };
    for (const log of logs) {
      byType[log.type] = (byType[log.type] ?? 0) + log.amount;
    }
    return (['MANUAL', 'AUTO', 'BONUS', 'STREAK'] as XPType[])
      .filter((t) => byType[t] > 0)
      .map((t) => ({
        label: t,
        value: byType[t],
        color: NEON_COLORS[t] ?? '#39ff14',
      }));
  }, [logs]);

  // 2. Category Strength - Radar (XP per category) + StatStrengthHeatmap (subcategories)
  const categoryXpByLogs = useMemo(() => {
    const map = new Map<string, number>();
    for (const log of logs) {
      if (log.categoryId) {
        map.set(log.categoryId, (map.get(log.categoryId) ?? 0) + log.amount);
      }
    }
    return map;
  }, [logs]);

  const radarData = useMemo(() => {
    const maxXp = Math.max(
      1,
      ...categories.map((c) => categoryXpByLogs.get(c.id) ?? 0)
    );
    return categories.slice(0, 8).map((c) => ({
      label: c.name,
      value: categoryXpByLogs.get(c.id) ?? 0,
      max: maxXp,
    }));
  }, [categories, categoryXpByLogs]);

  const heatmapData = useMemo(() => {
    const items: { label: string; value: number; max: number }[] = [];
    for (const cat of categories) {
      const catXp = categoryXpByLogs.get(cat.id) ?? 0;
      const subMax = Math.max(
        1,
        ...cat.subCategories.map(() => catXp)
      );
      for (const sub of cat.subCategories) {
        items.push({
          label: `${cat.name} / ${sub.name}`,
          value: Math.floor(catXp / Math.max(1, cat.subCategories.length)),
          max: subMax,
        });
      }
      if (cat.subCategories.length === 0) {
        items.push({ label: cat.name, value: catXp, max: Math.max(1, catXp) });
      }
    }
    return items.slice(0, 12);
  }, [categories, categoryXpByLogs]);

  // 3. Habit Analytics - Bar: completions per habit, Line: streak
  const completionsPerHabitData = useMemo(() => {
    return habits.map((h) => ({
      label: h.name.slice(0, 12),
      value: h.completions?.length ?? 0,
    }));
  }, [habits]);

  const streakLineData = useMemo(() => {
    return habits.map((h, i) => ({
      label: h.name.slice(0, 8),
      value: h.streak ?? 0,
    }));
  }, [habits]);

  // 4. Activity Density - Area chart daily XP last 30 days
  const dailyXpAreaData = useMemo(() => {
    return xpOverTimeData;
  }, [xpOverTimeData]);

  const cardClass =
    'border-2 border-zinc-800 bg-zinc-900 p-4 md:p-6 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]';

  return (
    <AppShell>
      <div className="space-y-8">
        <h1 className="font-heading text-xl md:text-2xl lg:text-3xl text-neonBlue">
          ANALYTICS
        </h1>

        {/* 1. Profile Overview */}
        <section className={cardClass}>
          <h2 className="font-heading text-sm text-neonGreen mb-6">
            PROFILE OVERVIEW
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <LineChart
                data={xpOverTimeData}
                height={220}
                title="XP OVER TIME (LAST 30 DAYS)"
                color="#00d4ff"
              />
            </div>
            <div>
              <BarChart
                data={levelProgressionData}
                height={220}
                title="LEVEL PROGRESSION"
              />
            </div>
          </div>
          <div className="mt-8">
            {xpByTypeData.length > 0 ? (
              <PieChart
                data={xpByTypeData}
                size={200}
                title="XP BY TYPE (MANUAL / AUTO / BONUS / STREAK)"
              />
            ) : (
              <div className="border-2 border-zinc-800 p-8 text-center">
                <p className="font-mono text-zinc-500 text-sm">
                  No XP logs yet. Complete habits or log XP to see breakdown.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 2. Category Strength */}
        <section className={cardClass}>
          <h2 className="font-heading text-sm text-neonGreen mb-6">
            CATEGORY STRENGTH
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              {radarData.length > 0 ? (
                <RadarChart
                  data={radarData}
                  height={240}
                  title="XP PER CATEGORY"
                />
              ) : (
                <div className="border-2 border-zinc-800 p-8 text-center h-[240px] flex items-center justify-center">
                  <p className="font-mono text-zinc-500 text-sm">
                    No categories or XP data yet.
                  </p>
                </div>
              )}
            </div>
            <div>
              {heatmapData.length > 0 ? (
                <StatStrengthHeatmap
                  data={heatmapData}
                  title="SUBCATEGORY STRENGTH"
                />
              ) : (
                <div className="border-2 border-zinc-800 p-8 text-center">
                  <p className="font-mono text-zinc-500 text-sm">
                    No subcategories with data.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 3. Habit Analytics */}
        <section className={cardClass}>
          <h2 className="font-heading text-sm text-neonGreen mb-6">
            HABIT ANALYTICS
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              {completionsPerHabitData.length > 0 ? (
                <BarChart
                  data={completionsPerHabitData}
                  height={220}
                  title="COMPLETIONS PER HABIT"
                />
              ) : (
                <div className="border-2 border-zinc-800 p-8 text-center h-[220px] flex items-center justify-center">
                  <p className="font-mono text-zinc-500 text-sm">
                    No habits yet.
                  </p>
                </div>
              )}
            </div>
            <div>
              {streakLineData.length > 0 ? (
                <LineChart
                  data={streakLineData}
                  height={220}
                  title="STREAK BY HABIT"
                  color="#ff2d95"
                />
              ) : (
                <div className="border-2 border-zinc-800 p-8 text-center h-[220px] flex items-center justify-center">
                  <p className="font-mono text-zinc-500 text-sm">
                    No habits with streak data.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 4. Activity Density */}
        <section className={cardClass}>
          <h2 className="font-heading text-sm text-neonGreen mb-6">
            ACTIVITY DENSITY
          </h2>
          <div>
            <AreaChart
              data={dailyXpAreaData}
              height={220}
              title="DAILY XP (LAST 30 DAYS)"
              color="#39ff14"
            />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
