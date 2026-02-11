'use client';

import {
  Zap,
  TrendingUp,
  Award,
  CheckSquare,
  FolderOpen,
  Flame,
} from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  accentColor: string;
}

function StatCard({ icon, value, label, accentColor }: StatCardProps) {
  return (
    <div
      className="border-2 border-white bg-zinc-900 p-4 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)]"
      style={{ borderLeftColor: accentColor, borderLeftWidth: 4 }}
    >
      <div className="flex items-center gap-2 mb-1" style={{ color: accentColor }}>
        {icon}
        <span className="font-mono text-sm font-medium">{value}</span>
      </div>
      <span className="font-body text-xs text-zinc-400 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

interface StatsOverviewProps {
  totalXP: number;
  level: number;
  rank: string;
  habitsActive: number;
  categoriesCount: number;
  currentStreak: number;
}

const ACCENT_COLORS = {
  xp: '#39ff14',
  level: '#00d4ff',
  rank: '#bf00ff',
  habits: '#ffe600',
  categories: '#ff2d95',
  streak: '#ff2d95',
};

export function StatsOverview({
  totalXP,
  level,
  rank,
  habitsActive,
  categoriesCount,
  currentStreak,
}: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <StatCard
        icon={<Zap className="w-4 h-4" strokeWidth={2} />}
        value={totalXP.toLocaleString()}
        label="Total XP"
        accentColor={ACCENT_COLORS.xp}
      />
      <StatCard
        icon={<TrendingUp className="w-4 h-4" strokeWidth={2} />}
        value={level}
        label="Current Level"
        accentColor={ACCENT_COLORS.level}
      />
      <StatCard
        icon={<Award className="w-4 h-4" strokeWidth={2} />}
        value={rank}
        label="Current Rank"
        accentColor={ACCENT_COLORS.rank}
      />
      <StatCard
        icon={<CheckSquare className="w-4 h-4" strokeWidth={2} />}
        value={habitsActive}
        label="Habits Active"
        accentColor={ACCENT_COLORS.habits}
      />
      <StatCard
        icon={<FolderOpen className="w-4 h-4" strokeWidth={2} />}
        value={categoriesCount}
        label="Categories"
        accentColor={ACCENT_COLORS.categories}
      />
      <StatCard
        icon={<Flame className="w-4 h-4" strokeWidth={2} />}
        value={currentStreak}
        label="Current Streak"
        accentColor={ACCENT_COLORS.streak}
      />
    </div>
  );
}
