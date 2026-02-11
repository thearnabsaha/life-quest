import type { Rank } from '@life-quest/types';
import clsx from 'clsx';

const RANK_GLOW: Record<Rank, string> = {
  E: 'text-zinc-500',
  D: 'text-neonBlue drop-shadow-[0_0_8px_#00d4ff]',
  C: 'text-neonGreen drop-shadow-[0_0_8px_#39ff14]',
  B: 'text-neonYellow drop-shadow-[0_0_8px_#ffe600]',
  A: 'text-neonPink drop-shadow-[0_0_8px_#ff2d95]',
  S: 'text-neonPurple drop-shadow-[0_0_8px_#bf00ff]',
  SS: 'text-neonPurple drop-shadow-[0_0_12px_#bf00ff]',
  SSS:
    'bg-clip-text bg-gradient-to-r from-neonPurple via-neonPink to-neonYellow text-transparent drop-shadow-[0_0_12px_#bf00ff]',
};

interface RankDisplayProps {
  rank: Rank;
  title: string;
  size?: 'sm' | 'md' | 'lg';
}

const rankSizeClasses = {
  sm: 'text-xl',
  md: 'text-2xl md:text-3xl',
  lg: 'text-4xl md:text-5xl',
};

export function RankDisplay({
  rank,
  title,
  size = 'md',
}: RankDisplayProps) {
  const glowClass = RANK_GLOW[rank] ?? RANK_GLOW.E;

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={clsx(
          'font-heading font-bold tracking-wider',
          glowClass,
          rankSizeClasses[size]
        )}
      >
        {rank}
      </span>
      <span className="font-body text-xs text-zinc-400 uppercase tracking-wider">
        {title}
      </span>
    </div>
  );
}
