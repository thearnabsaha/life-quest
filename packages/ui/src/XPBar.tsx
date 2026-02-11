import React from 'react';

interface XPBarProps {
  currentXP: number;
  maxXP: number;
  level: number;
  className?: string;
  color?: string;
}

export function XPBar({
  currentXP,
  maxXP,
  level,
  className = '',
  color = '#39ff14',
}: XPBarProps) {
  const percent = Math.min(100, (currentXP / maxXP) * 100);

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-1 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-zinc-400">
        <span>LVL {level}</span>
        <span>
          {currentXP} / {maxXP} XP
        </span>
      </div>
      <div className="h-4 w-full border-[2px] border-white bg-zinc-900">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${percent}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}, 0 0 20px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}
