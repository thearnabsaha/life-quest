'use client';

import { useMemo } from 'react';

const NEON_COLORS = [
  '#39ff14', // neonGreen
  '#00d4ff', // neonBlue
  '#ff2d95', // neonPink
  '#ffe600', // neonYellow
  '#bf00ff', // neonPurple
];

export interface PieChartDataItem {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartDataItem[];
  size?: number;
  title?: string;
}

export function PieChart({ data, size = 180, title }: PieChartProps) {
  const { segments, total } = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) {
      return { segments: [], total: 0 };
    }
    let offset = 0;
    const circumference = 2 * Math.PI * 45;
    const segments = data.map((d, i) => {
      const fraction = d.value / total;
      const dashLength = fraction * circumference;
      const dashOffset = -offset;
      offset += dashLength;
      return {
        label: d.label,
        color: d.color ?? NEON_COLORS[i % NEON_COLORS.length],
        dashArray: `${dashLength} ${circumference}`,
        dashOffset,
        value: d.value,
      };
    });
    return { segments, total };
  }, [data]);

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 20;
  const innerR = r * 0.5;

  const labelMaxLen = 8;
  const truncate = (s: string) =>
    s.length > labelMaxLen ? s.slice(0, labelMaxLen - 2) + '..' : s;

  return (
    <div className="w-full">
      {title && (
        <h3 className="font-heading text-xs text-zinc-400 mb-2">{title}</h3>
      )}
      <div className="flex flex-col items-center gap-4">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={r - innerR}
              strokeDasharray={seg.dashArray}
              strokeDashoffset={seg.dashOffset}
              strokeLinecap="butt"
            />
          ))}
          {/* Inner circle for donut center */}
          <circle
            cx={cx}
            cy={cy}
            r={innerR}
            fill="#0a0a0a"
            stroke="#27272a"
            strokeWidth={2}
          />
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3 border-2 border-zinc-800 p-3">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-3 h-3 border-2 border-white"
                style={{ backgroundColor: seg.color }}
              />
              <span className="font-mono text-xs text-zinc-300">
                {truncate(seg.label)}: {seg.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
