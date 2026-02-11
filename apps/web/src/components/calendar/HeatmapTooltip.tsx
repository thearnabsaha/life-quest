'use client';

interface HeatmapTooltipProps {
  date: string;
  totalXP: number;
  activityCount: number;
  x: number;
  y: number;
  visible: boolean;
}

export function HeatmapTooltip({
  date,
  totalXP,
  activityCount,
  x,
  y,
  visible,
}: HeatmapTooltipProps) {
  if (!visible) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none font-mono text-xs bg-zinc-900 border-2 border-white px-2 py-1.5 whitespace-nowrap"
      style={{
        left: x,
        top: y - 8,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div>{date}</div>
      <div className="text-neonGreen">{totalXP} XP</div>
      <div className="text-zinc-400">{activityCount} activit{activityCount === 1 ? 'y' : 'ies'}</div>
    </div>
  );
}
