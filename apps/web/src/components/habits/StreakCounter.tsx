'use client';

import { Flame } from 'lucide-react';

interface StreakCounterProps {
  count: number;
}

export function StreakCounter({ count }: StreakCounterProps) {
  const intensity = Math.min(count / 10, 1);
  const glowSize = 8 + intensity * 8;
  const glowOpacity = 0.3 + intensity * 0.5;

  return (
    <div className="flex items-center gap-2">
      <div
        className="relative flex items-center justify-center"
        style={{
          filter: `drop-shadow(0 0 ${glowSize}px rgba(255, 230, 0, ${glowOpacity}))`,
        }}
      >
        <Flame
          className="h-5 w-5 text-neonYellow md:h-6 md:w-6"
          strokeWidth={2.5}
          fill="currentColor"
        />
      </div>
      <span
        className="font-body text-base font-bold text-neonYellow md:text-lg"
        style={{
          textShadow: `0 0 ${glowSize}px rgba(255, 230, 0, ${glowOpacity * 0.8})`,
        }}
      >
        {count}
      </span>
      <span className="font-body text-xs text-zinc-400">
        {count === 1 ? 'day streak' : 'day streak'}
      </span>
    </div>
  );
}
