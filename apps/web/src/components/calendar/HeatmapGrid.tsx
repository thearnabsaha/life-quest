'use client';

import { useState, useCallback, useMemo } from 'react';
import type { CalendarEntry } from '@life-quest/types';
import { formatDate } from '@life-quest/utils';
import { HeatmapTooltip } from './HeatmapTooltip';

const CELL_SIZE = 14;
const GAP = 2;
const COLS = 53;
const ROWS = 7;

const DAY_LABELS = ['Mon', 'Wed', 'Fri'];
const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function getXpLevel(xp: number): number {
  if (xp === 0) return 0;
  if (xp <= 25) return 1;
  if (xp <= 50) return 2;
  if (xp <= 100) return 3;
  if (xp <= 200) return 4;
  return 5;
}

function getCellBgClass(level: number): string {
  if (level === 0) return 'bg-zinc-900';
  if (level === 1) return 'bg-[#39ff14]/20';
  if (level === 2) return 'bg-[#39ff14]/40';
  if (level === 3) return 'bg-[#39ff14]/60';
  if (level === 4) return 'bg-[#39ff14]/80';
  return 'bg-[#39ff14]';
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getActivityCount(entry: CalendarEntry | undefined): number {
  if (!entry?.activities) return 0;
  const act = entry.activities;
  if (typeof act === 'object' && act !== null && 'count' in act) {
    return Number(act.count) || 0;
  }
  return Object.keys(act).length || 0;
}

interface HeatmapGridProps {
  entries: CalendarEntry[];
  year: number;
}

export function HeatmapGrid({ entries, year }: HeatmapGridProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    date: string;
    xp: number;
    activityCount: number;
    x: number;
    y: number;
  } | null>(null);

  const entriesByDate = useMemo(() => {
    const map = new Map<string, CalendarEntry>();
    for (const e of entries) {
      map.set(e.date, e);
    }
    return map;
  }, [entries]);

  const { grid, monthCols } = useMemo(() => {
    const firstJan = new Date(year, 0, 1);
    const dayOfWeek = (firstJan.getDay() + 6) % 7;
    const firstMonday = new Date(firstJan);
    firstMonday.setDate(firstJan.getDate() - dayOfWeek);

    const lastDec = new Date(year, 11, 31);
    const grid: (string | null)[][] = Array.from({ length: ROWS }, () =>
      Array(COLS).fill(null)
    );
    const monthCols: Map<number, number> = new Map();

    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS; row++) {
        const cellDate = new Date(firstMonday);
        cellDate.setDate(firstMonday.getDate() + col * 7 + row);

        if (cellDate >= firstJan && cellDate <= lastDec) {
          const dateStr = formatDate(cellDate);
          grid[row][col] = dateStr;

          if (cellDate.getDate() === 1) {
            monthCols.set(cellDate.getMonth(), col);
          }
        }
      }
    }
    return { grid, monthCols };
  }, [year]);

  const handleMouseEnter = useCallback(
    (date: string, clientX: number, clientY: number) => {
      const entry = entriesByDate.get(date);
      const xp = entry?.totalXP ?? 0;
      const activityCount = getActivityCount(entry);
      setHoveredCell({
        date: formatDisplayDate(date),
        xp,
        activityCount,
        x: clientX,
        y: clientY,
      });
    },
    [entriesByDate]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (hoveredCell) {
        setHoveredCell((prev) =>
          prev ? { ...prev, x: e.clientX, y: e.clientY } : null
        );
      }
    },
    [hoveredCell]
  );

  return (
    <div className="overflow-x-auto pb-2">
      <div
        className="inline-flex flex-col gap-1 min-w-max"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Month labels row */}
        <div className="flex items-center h-4 pl-12 relative" style={{ width: COLS * (CELL_SIZE + GAP) - GAP }}>
          {Array.from({ length: 12 }, (_, m) => m).map((month) => {
            const col = monthCols.get(month);
            if (col === undefined) return null;
            return (
              <div
                key={month}
                className="absolute font-mono text-[10px] text-zinc-500"
                style={{ left: col * (CELL_SIZE + GAP) }}
              >
                {MONTH_LABELS[month]}
              </div>
            );
          })}
        </div>

        <div className="flex gap-[2px]">
          {/* Day labels column - 7 rows to match grid, labels at 0,2,4 */}
          <div
            className="flex flex-col pr-2 text-right"
            style={{ height: ROWS * (CELL_SIZE + GAP) - GAP }}
          >
            {Array.from({ length: ROWS }, (_, row) => (
              <div
                key={row}
                className="font-mono text-[10px] text-zinc-500 shrink-0"
                style={{ height: CELL_SIZE + GAP, lineHeight: `${CELL_SIZE + GAP}px` }}
              >
                {row === 0 ? 'Mon' : row === 2 ? 'Wed' : row === 4 ? 'Fri' : ''}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div
            className="flex gap-[2px]"
            style={{ width: COLS * (CELL_SIZE + GAP) - GAP }}
          >
            {Array.from({ length: COLS }, (_, col) => (
              <div key={col} className="flex flex-col gap-[2px]">
                {Array.from({ length: ROWS }, (_, row) => {
                  const dateStr = grid[row][col];
                  const entry = dateStr ? entriesByDate.get(dateStr) : undefined;
                  const xp = entry?.totalXP ?? 0;
                  const level = getXpLevel(xp);
                  const isEmpty = dateStr === null;

                  return (
                    <div
                      key={`${col}-${row}`}
                      className={`${isEmpty ? 'bg-transparent' : getCellBgClass(level)} border border-zinc-800/50 cursor-default transition-colors`}
                      style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        minWidth: CELL_SIZE,
                        minHeight: CELL_SIZE,
                      }}
                      onMouseEnter={(e) =>
                        dateStr && handleMouseEnter(dateStr, e.clientX, e.clientY)
                      }
                      onMouseLeave={handleMouseLeave}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <HeatmapTooltip
        date={hoveredCell?.date ?? ''}
        totalXP={hoveredCell?.xp ?? 0}
        activityCount={hoveredCell?.activityCount ?? 0}
        x={hoveredCell?.x ?? 0}
        y={hoveredCell?.y ?? 0}
        visible={hoveredCell !== null}
      />
    </div>
  );
}
