'use client';

import { useState, useMemo } from 'react';

const DEFAULT_COLOR = '#39ff14'; // neonGreen

export interface AreaChartDataItem {
  label: string;
  value: number;
}

interface AreaChartProps {
  data: AreaChartDataItem[];
  height?: number;
  title?: string;
  color?: string;
}

export function AreaChart({
  data,
  height = 200,
  title,
  color = DEFAULT_COLOR,
}: AreaChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { points, pathD, areaD, maxValue, padding } = useMemo(() => {
    const padding = { left: 40, right: 24, top: 24, bottom: 40 };
    const chartWidth = 400;
    const chartHeight = height - padding.top - padding.bottom;
    const max = Math.max(1, ...data.map((d) => d.value));
    const count = data.length;
    const stepX = count > 1 ? chartWidth / (count - 1) : chartWidth;

    const points = data.map((d, i) => ({
      x: padding.left + i * stepX,
      y: padding.top + chartHeight - (d.value / max) * chartHeight,
      value: d.value,
      label: d.label,
    }));

    const pathD = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');
    const areaD =
      pathD +
      ` L ${points[points.length - 1]?.x ?? 0} ${height - padding.bottom}` +
      ` L ${padding.left} ${height - padding.bottom} Z`;

    return {
      points,
      pathD,
      areaD,
      maxValue: max,
      padding,
    };
  }, [data, height]);

  const fillColor = color === DEFAULT_COLOR ? 'rgba(57, 255, 20, 0.35)' : `${color}59`;

  const labelMaxLen = 8;
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
        {/* Grid lines */}
        {Array.from({ length: 6 }, (_, i) => {
          const y = padding.top + ((height - padding.top - padding.bottom) * i) / 5;
          return (
            <line
              key={i}
              x1={padding.left}
              y1={y}
              x2={440 - padding.right}
              y2={y}
              stroke="#3f3f46"
              strokeWidth={1}
            />
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill={fillColor} stroke="none" />

        {/* Line stroke */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="square"
          strokeLinejoin="miter"
        />

        {/* Data point circles */}
        {points.map((p, i) => {
          const isHovered = hoveredIndex === i;
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={isHovered ? 5 : 3}
              fill={color}
              stroke="#0a0a0a"
              strokeWidth={1}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            />
          );
        })}

        {/* X-axis labels */}
        {points.map(
          (p, i) =>
            (i % Math.max(1, Math.floor(points.length / 6)) === 0 ||
              i === points.length - 1) && (
              <text
                key={i}
                x={p.x}
                y={height - padding.bottom + 18}
                fill="#71717a"
                fontSize={9}
                fontFamily="JetBrains Mono, monospace"
                textAnchor="middle"
              >
                {truncate(p.label)}
              </text>
            )
        )}

        {/* Hover tooltip */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <g>
            <rect
              x={points[hoveredIndex].x - 28}
              y={points[hoveredIndex].y - 28}
              width={56}
              height={20}
              fill="#18181b"
              stroke="#52525b"
              strokeWidth={2}
            />
            <text
              x={points[hoveredIndex].x}
              y={points[hoveredIndex].y - 14}
              fill={color}
              fontSize={10}
              fontFamily="JetBrains Mono, monospace"
              textAnchor="middle"
            >
              {points[hoveredIndex].value}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
