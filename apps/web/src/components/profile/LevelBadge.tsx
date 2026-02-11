import type { Rank } from '@life-quest/types';
import clsx from 'clsx';

const RANK_COLORS: Record<Rank, string> = {
  E: 'border-zinc-500 text-zinc-400 shadow-[6px_6px_0px_0px_#71717a]',
  D: 'border-neonBlue text-neonBlue shadow-[6px_6px_0px_0px_#00d4ff]',
  C: 'border-neonGreen text-neonGreen shadow-[6px_6px_0px_0px_#39ff14]',
  B: 'border-neonYellow text-neonYellow shadow-[6px_6px_0px_0px_#ffe600]',
  A: 'border-neonPink text-neonPink shadow-[6px_6px_0px_0px_#ff2d95]',
  S: 'border-neonPurple text-neonPurple shadow-[6px_6px_0px_0px_#bf00ff]',
  SS: 'border-neonPurple text-neonPurple shadow-[6px_6px_0px_0px_#bf00ff]',
  SSS: 'border-neonPurple shadow-[6px_6px_0px_0px_#bf00ff]',
};

interface LevelBadgeProps {
  level: number;
  rank: Rank;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
};

export function LevelBadge({
  level,
  rank,
  size = 'md',
}: LevelBadgeProps) {
  const colorClass = RANK_COLORS[rank] ?? RANK_COLORS.E;
  const isSSS = rank === 'SSS';

  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center font-heading font-bold',
        'border-2 bg-zinc-900',
        colorClass,
        sizeClasses[size]
      )}
    >
      {isSSS ? (
        <span className="bg-gradient-to-r from-neonPurple via-neonPink to-neonYellow bg-clip-text text-transparent">
          {level}
        </span>
      ) : (
        level
      )}
    </span>
  );
}
