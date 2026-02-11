'use client';

import { useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useCalendarStore } from '@/stores/useCalendarStore';
import { HeatmapGrid } from '@/components/calendar/HeatmapGrid';
import { YearNavigator } from '@/components/calendar/YearNavigator';
import { CalendarStats } from '@/components/calendar/CalendarStats';

function getLegendBgClass(level: number): string {
  if (level === 0) return 'bg-zinc-900';
  if (level === 1) return 'bg-[#39ff14]/20';
  if (level === 2) return 'bg-[#39ff14]/40';
  if (level === 3) return 'bg-[#39ff14]/60';
  if (level === 4) return 'bg-[#39ff14]';
  return 'bg-zinc-900';
}

export default function CalendarPage() {
  const { entries, year, fetchCalendar, isLoading } = useCalendarStore();

  useEffect(() => {
    fetchCalendar(year);
  }, [year, fetchCalendar]);

  const handleYearChange = (newYear: number) => {
    fetchCalendar(newYear);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="font-heading text-xl md:text-2xl lg:text-3xl text-white">
          ACTIVITY CALENDAR
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <YearNavigator
            year={year}
            onYearChange={handleYearChange}
            isLoading={isLoading}
          />
        </div>

        <div className="border-2 border-white bg-zinc-900 p-4 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="font-mono text-zinc-500">Loading...</div>
            </div>
          ) : (
            <>
              <HeatmapGrid entries={entries} year={year} />

              {/* Color legend */}
              <div className="flex items-center gap-2 mt-4">
                <span className="font-mono text-[10px] text-zinc-500 mr-2">
                  Less
                </span>
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`border border-zinc-800 ${getLegendBgClass(level)}`}
                    style={{ width: 14, height: 14 }}
                  />
                ))}
                <span className="font-mono text-[10px] text-zinc-500 ml-2">
                  More
                </span>
              </div>
            </>
          )}
        </div>

        <CalendarStats entries={entries} year={year} />
      </div>
    </AppShell>
  );
}
