'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRadarStore, type CategoryWithSubRadar } from '@/stores/useRadarStore';
import { useProfileStore } from '@/stores/useProfileStore';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Zap, TrendingUp, Flame, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TimeRange = 'week' | 'month' | 'all';

const RANGE_OPTIONS: { value: TimeRange; label: string; icon: typeof Clock }[] = [
  { value: 'week', label: 'LAST 7 DAYS', icon: Clock },
  { value: 'month', label: 'LAST 30 DAYS', icon: Clock },
  { value: 'all', label: 'ALL TIME', icon: TrendingUp },
];

const NEON_COLORS: Record<string, string> = {
  neonGreen: '#39ff14',
  neonPink: '#ff2d95',
  neonBlue: '#00d4ff',
  neonYellow: '#ffe600',
  neonPurple: '#bf00ff',
};

function getColorForIndex(i: number): string {
  const colors = Object.values(NEON_COLORS);
  return colors[i % colors.length];
}

interface TooltipPayload {
  payload?: {
    fullName?: string;
    xp?: number;
    level?: number;
    streak?: number;
    icon?: string | null;
  };
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;

  return (
    <div className="border-2 border-neonGreen bg-zinc-950 p-4 shadow-[4px_4px_0px_0px_#39ff14]">
      <div className="flex items-center gap-2 mb-2">
        {d.icon && <span className="text-lg">{d.icon}</span>}
        <span className="font-heading text-xs text-white">{d.fullName}</span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-neonGreen" />
          <span className="font-mono text-xs text-neonGreen">
            {(d.xp ?? 0).toLocaleString()} XP
          </span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3 h-3 text-neonBlue" />
          <span className="font-mono text-xs text-neonBlue">Level {d.level ?? 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <Flame className="w-3 h-3 text-neonYellow" />
          <span className="font-mono text-xs text-neonYellow">
            {d.streak ?? 0} day streak
          </span>
        </div>
      </div>
    </div>
  );
}

// Custom tick renderer to prevent label overlap
function CustomAngleTick({ payload, x, y, textAnchor, ...rest }: {
  payload: { value: string };
  x: number;
  y: number;
  textAnchor: string;
  [key: string]: unknown;
}) {
  const label = payload.value;
  // Offset labels outward a bit to avoid overlapping the chart edge
  const dx = textAnchor === 'end' ? -4 : textAnchor === 'start' ? 4 : 0;
  const dy = y < 100 ? -4 : y > 300 ? 8 : 0;
  return (
    <text
      x={x + dx}
      y={y + dy}
      textAnchor={textAnchor as 'start' | 'middle' | 'end'}
      fill="#a1a1aa"
      fontSize={9}
      fontFamily="Inter, sans-serif"
    >
      {label}
    </text>
  );
}

function SubCategoryRadarSection({ category, timeRange }: { category: CategoryWithSubRadar; timeRange: TimeRange }) {
  const [expanded, setExpanded] = useState(false);

  const chartData = useMemo(() => {
    const count = category.subCategories.length;
    const maxLen = count > 6 ? 5 : count > 4 ? 7 : 10;
    return category.subCategories.map((sub) => {
      const xpVal = timeRange === 'week' ? sub.last7DaysXP : timeRange === 'month' ? sub.last30DaysXP : sub.totalXP;
      return {
        subject: sub.subCategoryName.length > maxLen ? sub.subCategoryName.slice(0, maxLen) + '..' : sub.subCategoryName,
        fullName: sub.subCategoryName,
        xp: xpVal,
        level: sub.level,
        streak: sub.streak,
        habitCount: sub.habitCount,
        A: xpVal,
      };
    });
  }, [category, timeRange]);

  const maxXP = useMemo(() => Math.max(100, ...chartData.map((d) => d.xp)), [chartData]);
  const totalXP = useMemo(() => chartData.reduce((sum, d) => sum + d.xp, 0), [chartData]);

  const hexColor = NEON_COLORS[category.categoryColor ?? 'neonGreen'] ?? NEON_COLORS.neonGreen;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-2 bg-zinc-900"
      style={{ borderColor: hexColor, boxShadow: `4px 4px 0px 0px ${hexColor}40` }}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{category.categoryIcon || '📁'}</span>
          <div className="text-left">
            <span className="font-heading text-xs text-white block">{category.categoryName}</span>
            <span className="font-mono text-[10px] text-zinc-500">
              {category.subCategories.length} subcategories &middot; {totalXP.toLocaleString()} XP
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs" style={{ color: hexColor }}>
            {totalXP.toLocaleString()} XP
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-zinc-800 pt-4">
              {category.subCategories.length < 3 ? (
                // Not enough data for radar, show a simple bar list
                <div className="space-y-3">
                  {chartData.map((sub, i) => {
                    const pct = maxXP > 0 ? (sub.xp / maxXP) * 100 : 0;
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-body text-sm text-white">{sub.fullName}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs" style={{ color: hexColor }}>
                              {sub.xp.toLocaleString()} XP
                            </span>
                            {sub.streak > 0 && (
                              <span className="font-mono text-xs text-neonYellow">
                                🔥{sub.streak}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="h-2 border border-zinc-700 bg-zinc-800">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="h-full"
                            style={{ backgroundColor: hexColor }}
                          />
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                          <span>Lv {sub.level}</span>
                          <span>{sub.habitCount} habits</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Radar chart for 3+ subcategories
                <div>
                  <ResponsiveContainer width="100%" height={260}>
                    <RadarChart cx="50%" cy="50%" outerRadius="55%" data={chartData}>
                      <PolarGrid stroke="#3f3f46" strokeDasharray="3 3" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#a1a1aa', fontSize: 9, fontFamily: 'Inter, sans-serif' }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, maxXP]}
                        tick={false}
                        axisLine={false}
                      />
                      <Radar
                        name="XP"
                        dataKey="A"
                        stroke={hexColor}
                        fill={hexColor}
                        fillOpacity={0.15}
                        strokeWidth={2}
                        animationDuration={300}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0]?.payload as typeof chartData[number] | undefined;
                          if (!d) return null;
                          return (
                            <div className="border-2 bg-zinc-950 p-3" style={{ borderColor: hexColor }}>
                              <p className="font-heading text-xs text-white mb-1">{d.fullName}</p>
                              <p className="font-mono text-xs" style={{ color: hexColor }}>
                                {d.xp.toLocaleString()} XP &middot; Lv {d.level}
                              </p>
                              <p className="font-mono text-[10px] text-zinc-500">
                                {d.habitCount} habits &middot; {d.streak > 0 ? `🔥${d.streak}` : 'No streak'}
                              </p>
                            </div>
                          );
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>

                  {/* Sub breakdown list */}
                  <div className="mt-2 space-y-1.5">
                    {chartData.map((sub, i) => {
                      const pct = maxXP > 0 ? (sub.xp / maxXP) * 100 : 0;
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <span className="font-body text-xs text-zinc-400 w-24 truncate">
                            {sub.fullName}
                          </span>
                          <div className="flex-1 h-1.5 border border-zinc-700 bg-zinc-800">
                            <div
                              className="h-full transition-all"
                              style={{ width: `${pct}%`, backgroundColor: hexColor }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-zinc-500 w-14 text-right">
                            {sub.xp.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function RadarPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const { stats, subCategoryRadar, timeRange, isLoading, isLoadingSubs, setTimeRange, fetchStats, fetchSubCategoryRadar } = useRadarStore();
  const { profile, fetchProfile } = useProfileStore();

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    fetchStats();
    fetchProfile();
    fetchSubCategoryRadar();
  }, [user, isInitialized, router, fetchStats, fetchProfile, fetchSubCategoryRadar]);

  const chartData = useMemo(() => {
    const count = stats.length;
    // Shorten labels based on how many categories there are
    const maxLen = count > 8 ? 5 : count > 5 ? 7 : 10;
    return stats.map((s) => {
      const xpVal = timeRange === 'week' ? s.last7DaysXP : timeRange === 'month' ? s.last30DaysXP : s.totalXP;
      const truncated = s.categoryName.length > maxLen ? s.categoryName.slice(0, maxLen) + '..' : s.categoryName;
      return {
        subject: truncated,
        fullName: s.categoryName,
        xp: xpVal,
        level: s.level,
        streak: s.streak,
        icon: s.categoryIcon,
        A: xpVal,
      };
    });
  }, [stats, timeRange]);

  const maxXP = useMemo(() => {
    return Math.max(100, ...chartData.map((d) => d.xp));
  }, [chartData]);

  // Summary stats
  const totalXP = useMemo(() => chartData.reduce((sum, d) => sum + d.xp, 0), [chartData]);
  const avgLevel = useMemo(() => {
    if (!chartData.length) return 0;
    return Math.round(chartData.reduce((sum, d) => sum + d.level, 0) / chartData.length);
  }, [chartData]);
  const topCategory = useMemo(() => {
    if (!chartData.length) return null;
    return [...chartData].sort((a, b) => b.xp - a.xp)[0];
  }, [chartData]);

  if (!isInitialized || !user) return null;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-heading text-xl md:text-2xl text-neonBlue">
            STATS RADAR
          </h1>
        </div>

        {/* Time Range Toggle */}
        <div className="flex border-2 border-white">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTimeRange(opt.value)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-heading text-[10px] md:text-xs transition-all border-r-2 border-white last:border-r-0 ${
                timeRange === opt.value
                  ? 'bg-neonBlue text-black shadow-[inset_0_0_20px_rgba(0,212,255,0.3)]'
                  : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-2 border-neonGreen bg-zinc-900 p-4 shadow-[4px_4px_0px_0px_#39ff14]"
          >
            <p className="font-body text-xs uppercase tracking-wider text-zinc-400">
              Total XP ({timeRange === 'week' ? '7d' : timeRange === 'month' ? '30d' : 'All'})
            </p>
            <p className="mt-1 font-heading text-2xl text-neonGreen">
              {totalXP.toLocaleString()}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border-2 border-neonBlue bg-zinc-900 p-4 shadow-[4px_4px_0px_0px_#00d4ff]"
          >
            <p className="font-body text-xs uppercase tracking-wider text-zinc-400">
              Avg Category Level
            </p>
            <p className="mt-1 font-heading text-2xl text-neonBlue">{avgLevel}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border-2 border-neonYellow bg-zinc-900 p-4 shadow-[4px_4px_0px_0px_#ffe600]"
          >
            <p className="font-body text-xs uppercase tracking-wider text-zinc-400">
              Top Category
            </p>
            <p className="mt-1 font-heading text-lg text-neonYellow">
              {topCategory ? `${topCategory.icon ?? ''} ${topCategory.fullName}` : 'N/A'}
            </p>
          </motion.div>
        </div>

        {/* Radar Chart */}
        <div
          className="border-2 border-white bg-zinc-900 p-6 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]"
        >
          <h2 className="font-heading text-sm text-neonGreen mb-4">
            CATEGORY POWER MAP
          </h2>
          {isLoading ? (
            <div className="h-[400px] flex items-center justify-center">
              <p className="font-body text-zinc-500 animate-pulse">Loading stats...</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <p className="font-body text-zinc-400 mb-2">No categories with XP data yet.</p>
                <p className="font-body text-xs text-zinc-500">
                  Create categories and log XP to see your stats radar.
                </p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={380}>
              <RadarChart cx="50%" cy="50%" outerRadius="60%" data={chartData}>
                <PolarGrid
                  stroke="#3f3f46"
                  strokeDasharray="3 3"
                />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={CustomAngleTick as any}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, maxXP]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="XP"
                  dataKey="A"
                  stroke="#39ff14"
                  fill="#39ff14"
                  fillOpacity={0.15}
                  strokeWidth={2}
                  animationDuration={400}
                  animationEasing="ease-out"
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Breakdown Table */}
        <div className="border-2 border-white bg-zinc-900 p-6 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]">
          <h2 className="font-heading text-sm text-neonPink mb-4">
            CATEGORY BREAKDOWN
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-zinc-700">
                  <th className="p-3 text-left font-heading text-[10px] text-zinc-400 uppercase">Category</th>
                  <th className="p-3 text-right font-heading text-[10px] text-zinc-400 uppercase">XP</th>
                  <th className="p-3 text-right font-heading text-[10px] text-zinc-400 uppercase">Level</th>
                  <th className="p-3 text-right font-heading text-[10px] text-zinc-400 uppercase">Streak</th>
                  <th className="p-3 text-left font-heading text-[10px] text-zinc-400 uppercase">Power</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat, i) => {
                  const xpVal = timeRange === 'week' ? stat.last7DaysXP : timeRange === 'month' ? stat.last30DaysXP : stat.totalXP;
                  const pct = maxXP > 0 ? (xpVal / maxXP) * 100 : 0;
                  return (
                    <tr
                      key={stat.categoryId}
                      className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{stat.categoryIcon || '📁'}</span>
                          <span className="font-body text-sm text-white">{stat.categoryName}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <span className="font-mono text-sm text-neonGreen">
                          {xpVal.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className="font-mono text-sm text-neonBlue">{stat.level}</span>
                      </td>
                      <td className="p-3 text-right">
                        <span className="font-mono text-sm text-neonYellow">
                          {stat.streak > 0 ? `🔥 ${stat.streak}` : '—'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 border border-zinc-700 bg-zinc-800 max-w-[120px]">
                            <div
                              className="h-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: getColorForIndex(i) }}
                            />
                          </div>
                          <span className="font-mono text-xs text-zinc-500">
                            {Math.round(pct)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {stats.length === 0 && (
            <p className="text-center py-8 font-body text-sm text-zinc-500">
              No categories found. Create categories to see your stats.
            </p>
          )}
        </div>

        {/* Subcategory Radar Charts */}
        <div className="border-2 border-white bg-zinc-900 p-6 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]">
          <h2 className="font-heading text-sm text-neonPurple mb-4">
            SUBCATEGORY BREAKDOWN
          </h2>
          <p className="font-body text-xs text-zinc-500 mb-4">
            Drill down into each category to see how your subcategories are performing.
          </p>

          {isLoadingSubs ? (
            <div className="h-24 flex items-center justify-center">
              <p className="font-body text-zinc-500 animate-pulse">Loading subcategory data...</p>
            </div>
          ) : subCategoryRadar.length === 0 ? (
            <div className="h-24 flex items-center justify-center">
              <p className="font-body text-sm text-zinc-500">
                No categories with subcategories found. Add subcategories to see detailed radar charts.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {subCategoryRadar.map((cat) => (
                <SubCategoryRadarSection
                  key={cat.categoryId}
                  category={cat}
                  timeRange={timeRange}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
