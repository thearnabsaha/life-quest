'use client';

import { getRank } from '@life-quest/utils';
import clsx from 'clsx';

const TIER_GLOW_COLORS: Record<number, string> = {
  1: '#39ff14', // neonGreen
  2: '#00d4ff', // neonBlue
  3: '#bf00ff', // neonPurple
};

interface AvatarDisplayProps {
  avatarTier: number;
  level: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-16 h-16 text-lg',
  md: 'w-24 h-24 text-2xl',
  lg: 'w-32 h-32 text-3xl',
};

export function AvatarDisplay({
  avatarTier,
  level,
  size = 'md',
}: AvatarDisplayProps) {
  const tier = Math.min(3, Math.max(1, avatarTier));
  const glowColor = TIER_GLOW_COLORS[tier] ?? TIER_GLOW_COLORS[1];
  const rank = getRank(level);

  const containerStyle: Record<string, string | number> = {
    boxShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor}40`,
    borderColor: glowColor,
    ...(tier === 2 && {
      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
    }),
    ...(tier === 3 && {
      clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    }),
  };

  return (
    <div
      className={clsx(
        'relative flex items-center justify-center border-2 bg-zinc-900 overflow-hidden',
        'animate-[pulse_2s_ease-in-out_infinite]',
        sizeClasses[size]
      )}
      style={containerStyle}
    >
      {/* Tier 1: circle | Tier 2: hexagon | Tier 3: diamond (clip-path on container) */}
      {tier === 1 && (
        <div
          className="absolute inset-[2px] rounded-full border-2 bg-zinc-950"
          style={{ borderColor: glowColor }}
        />
      )}
      {tier >= 2 && (
        <div
          className="absolute inset-[3px] bg-zinc-950"
          style={{
            clipPath:
              tier === 2
                ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                : 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          }}
        />
      )}

      {/* Rank letter - centered */}
      <span
        className="relative z-10 font-heading font-bold"
        style={{ color: glowColor, textShadow: `0 0 10px ${glowColor}` }}
      >
        {rank}
      </span>
    </div>
  );
}
