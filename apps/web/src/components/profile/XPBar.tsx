'use client';

import {
  calculateLevel,
  xpForNextLevel,
  xpProgressPercent,
} from '@life-quest/utils';

interface XPBarProps {
  totalXP: number;
  manualLevelOverride?: number | null;
  manualXPOverride?: number | null;
}

export function XPBar({
  totalXP,
  manualLevelOverride,
  manualXPOverride,
}: XPBarProps) {
  const effectiveXP = manualXPOverride ?? totalXP;
  const effectiveLevel = manualLevelOverride ?? calculateLevel(effectiveXP);
  const nextLevelXP = xpForNextLevel(effectiveLevel);
  const currentLevelXP = Math.pow(effectiveLevel, 2) * 100;
  const xpInLevel = effectiveXP - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  const progress = Math.min(
    100,
    Math.max(0, (xpInLevel / xpNeededForLevel) * 100)
  );

  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between font-mono text-xs">
        <span className="text-neonGreen">LVL {effectiveLevel}</span>
        <span className="text-white/80">
          {effectiveXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
        </span>
      </div>
      <div className="h-4 w-full border-2 border-white bg-zinc-900 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
        <div
          className="h-full bg-neonGreen transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            boxShadow: '0 0 12px #39ff14, inset 0 0 8px rgba(57,255,20,0.3)',
          }}
        />
      </div>
    </div>
  );
}
