'use client';

import { useState, useMemo } from 'react';

const NEON_COLORS = [
  '#39ff14', // neonGreen
  '#00d4ff', // neonBlue
  '#ff2d95', // neonPink
  '#ffe600', // neonYellow
  '#bf00ff', // neonPurple
];

export interface BarChartDataItem {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartDataItem[];
  height?: number;
  title?: string;
}

export function BarChart({ data, height = 200, title }: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { maxValue, barWidth, gap, padding, barOffset } = useMemo(() => {
    const max = Math.max(1, ...data.map((d) => d.value));
    const pad = { left: 40, right: 24, top: 24, bottom: 40 };
    const chartWidth = 400;
    const totalBars = data.length;
    const g = totalBars > 1 ? 8 : 0;
    const availableWidth = chartWidth - pad.left - pad.right;
    const bw = totalBars
      ? Math.min(32, (availableWidth - g * (totalBars - 1)) / totalBars)
      : 20;
    const totalBarWidth = totalBars * bw + (totalBars - 1) * g;
    const offset = (availableWidth - totalBarWidth) / 2;
    return {
      maxValue: max,
      barWidth: bw,
      gap: g,
      padding: pad,
      barOffset: offset,
    };
  }, [data]);

  const getBarX = (i: number) =>
    padding.left + barOffset + i * (barWidth + gap);

  const chartHeight = height - padding.top - padding.bottom;
  const yTicks = 5;
  const labelMaxLen = 10;

  const truncate = (s: string) =>
    s.length > labelMaxLen ? s.slice(0, labelMaxLen - 2) + '..' : s;

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
        {/* Y-axis grid lines */}
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const y = padding.top + (chartHeight * i) / yTicks;
          const val =
            maxValue > 0
              ? Math.round(maxValue * (1 - i / yTicks))
              : 0;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={440 - padding.right}
                y2={y}
                stroke="#3f3f46"
                strokeWidth={1}
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                fill="#71717a"
                fontSize={10}
                fontFamily="JetBrains Mono, monospace"
                textAnchor="end"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* X-axis */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={440 - padding.right}
          y2={height - padding.bottom}
          stroke="#52525b"
          strokeWidth={2}
        />

        {/* Bars */}
        {data.map((item, i) => {
          const color = item.color ?? NEON_COLORS[i % NEON_COLORS.length];
          const barHeight =
            maxValue > 0
              ? (item.value / maxValue) * chartHeight
              : 0;
          const x = getBarX(i);
          const y = height - padding.bottom - barHeight;
          const isHovered = hoveredIndex === i;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                stroke={isHovered ? '#fff' : 'transparent'}
                strokeWidth={2}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              />
              {/* X-axis label */}
              <text
                x={x + barWidth / 2}
                y={height - padding.bottom + 20}
                fill="#a1a1aa"
                fontSize={9}
                fontFamily="JetBrains Mono, monospace"
                textAnchor="middle"
              >
                {truncate(item.label)}
              </text>
            </g>
          );
        })}

        {/* Hover tooltip */}
        {hoveredIndex !== null && data[hoveredIndex] && (
          <g>
            <rect
              x={getBarX(hoveredIndex) + barWidth / 2 - 24}
              y={
                height -
                padding.bottom -
                (data[hoveredIndex].value / maxValue) * chartHeight -
                32
              }
              width={48}
              height={20}
              fill="#18181b"
              stroke="#52525b"
              strokeWidth={2}
            />
            <text
              x={getBarX(hoveredIndex) + barWidth / 2}
              y={
                height -
                padding.bottom -
                (data[hoveredIndex].value / maxValue) * chartHeight -
                18
              }
              fill="#39ff14"
              fontSize={10}
              fontFamily="JetBrains Mono, monospace"
              textAnchor="middle"
            >
              {data[hoveredIndex].value}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
