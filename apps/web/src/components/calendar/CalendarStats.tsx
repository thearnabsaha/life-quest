'use client';

import { useMemo } from 'react';
import type { CalendarEntry } from '@life-quest/types';
import { formatDate } from '@life-quest/utils';

interface CalendarStatsProps {
  entries: CalendarEntry[];
  year: number;
}

export function CalendarStats({ entries, year }: CalendarStatsProps) {
  const stats = useMemo(() => {
    const totalXP = entries.reduce((sum, e) => sum + e.totalXP, 0);
    const daysWithActivity = entries.filter((e) => e.totalXP > 0).length;
    const avgDailyXP = daysWithActivity > 0 ? Math.round(totalXP / daysWithActivity) : 0;

    let mostActiveDay: { date: string; xp: number } | null = null;
    for (const e of entries) {
      if (!mostActiveDay || e.totalXP > mostActiveDay.xp) {
        mostActiveDay = { date: e.date, xp: e.totalXP };
      }
    }

    let currentStreak = 0;
    const today = formatDate(new Date());
    const entriesByDate = new Map(entries.map((e) => [e.date, e]));
    const sortedDates = entries
      .filter((e) => e.totalXP > 0)
      .map((e) => e.date)
      .sort();

    if (sortedDates.length > 0) {
      const latest = sortedDates[sortedDates.length - 1];
      const latestDate = new Date(latest + 'T12:00:00');
      const todayDate = new Date(today + 'T12:00:00');
      const diffDays = Math.floor(
        (todayDate.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays <= 1) {
        let checkDate = new Date(today + 'T12:00:00');
        const yearStart = new Date(year, 0, 1);
        while (checkDate >= yearStart) {
          const dateStr = formatDate(checkDate);
          const entry = entriesByDate.get(dateStr);
          if (entry && entry.totalXP > 0) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    const mostActiveFormatted = mostActiveDay
      ? new Date(mostActiveDay.date + 'T12:00:00').toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      : '—';

    return {
      totalXP,
      mostActiveDay: mostActiveFormatted,
      mostActiveXP: mostActiveDay?.xp ?? 0,
      currentStreak,
      avgDailyXP,
    };
  }, [entries, year]);

  const statCards = [
    {
      label: 'Total XP this year',
      value: stats.totalXP.toLocaleString(),
      suffix: 'XP',
    },
    {
      label: 'Most active day',
      value: stats.mostActiveDay,
      suffix: stats.mostActiveXP > 0 ? `(${stats.mostActiveXP} XP)` : '',
    },
    {
      label: 'Current streak',
      value: stats.currentStreak.toString(),
      suffix: 'days',
    },
    {
      label: 'Average daily XP',
      value: stats.avgDailyXP.toString(),
      suffix: 'XP',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {statCards.map(({ label, value, suffix }) => (
        <div
          key={label}
          className="border-2 border-white bg-zinc-900 p-4"
          style={{ boxShadow: '4px 4px 0px 0px #39ff14' }}
        >
          <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
            {label}
          </div>
          <div className="font-heading text-lg text-neonGreen">
            {value} {suffix && <span className="text-white font-body text-sm font-normal">{suffix}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
