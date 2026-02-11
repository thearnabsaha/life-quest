'use client';

import { useMemo } from 'react';

const DEFAULT_COLOR = '#39ff14'; // neonGreen

export interface RadarChartDataItem {
  label: string;
  value: number;
  max: number;
}

interface RadarChartProps {
  data: RadarChartDataItem[];
  height?: number;
  title?: string;
}

export function RadarChart({
  data,
  height = 220,
  title,
}: RadarChartProps) {
  const { centerX, centerY, radius, polygonPoints, labelPoints } = useMemo(() => {
    const size = Math.min(400, height - 40);
    const centerX = 220;
    const centerY = height / 2;
    const radius = size / 2 - 40;
    const count = data.length;

    if (count === 0) {
      return { centerX, centerY, radius, polygonPoints: '', labelPoints: [] };
    }

    const angleStep = (2 * Math.PI) / count;
    const startAngle = -Math.PI / 2; // Start from top

    const polygonPoints = data
      .map((d, i) => {
        const angle = startAngle + i * angleStep;
        const r = radius * (d.max > 0 ? Math.min(1, d.value / d.max) : 0);
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');

    const labelPoints = data.map((d, i) => {
      const angle = startAngle + i * angleStep;
      const labelRadius = radius + 24;
      const x = centerX + labelRadius * Math.cos(angle);
      const y = centerY + labelRadius * Math.sin(angle);
      return { x, y, label: d.label };
    });

    return { centerX, centerY, radius, polygonPoints, labelPoints };
  }, [data, height]);

  const labelMaxLen = 10;
  const truncate = (s: string) =>
    s.length > labelMaxLen ? s.slice(0, labelMaxLen - 2) + '..' : s;

  const rings = 4;

  return (
    <div className="w-full overflow-x-auto">
      {title && (
        <h3 className="font-heading text-xs text-zinc-400 mb-2">{title}</h3>
      )}
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 440 ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="min-w-[280px]"
      >
        {/* Grid rings */}
        {Array.from({ length: rings }, (_, ri) => {
          const r = (radius * (ri + 1)) / rings;
          const pts = data.map((_, i) => {
            const angle = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(1, data.length);
            return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`;
          });
          if (pts.length < 2) return null;
          return (
            <polygon
              key={ri}
              points={pts.join(' ')}
              fill="none"
              stroke="#3f3f46"
              strokeWidth={1}
            />
          );
        })}

        {/* Axes */}
        {data.map((_, i) => {
          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(1, data.length);
          const x2 = centerX + radius * Math.cos(angle);
          const y2 = centerY + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={x2}
              y2={y2}
              stroke="#3f3f46"
              strokeWidth={1}
            />
          );
        })}

        {/* Data polygon fill */}
        {data.length > 0 && polygonPoints && (
          <polygon
            points={polygonPoints}
            fill="rgba(57, 255, 20, 0.3)"
            stroke="#39ff14"
            strokeWidth={2}
            strokeLinejoin="miter"
          />
        )}

        {/* Labels */}
        {labelPoints.map((lp, i) => (
          <text
            key={i}
            x={lp.x}
            y={lp.y}
            fill="#a1a1aa"
            fontSize={9}
            fontFamily="JetBrains Mono, monospace"
            textAnchor={lp.x >= centerX ? 'start' : 'end'}
            dominantBaseline="middle"
          >
            {truncate(lp.label)}
          </text>
        ))}
      </svg>
    </div>
  );
}
