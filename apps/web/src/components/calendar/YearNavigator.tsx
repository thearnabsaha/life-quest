'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface YearNavigatorProps {
  year: number;
  onYearChange: (year: number) => void;
  isLoading?: boolean;
}

export function YearNavigator({
  year,
  onYearChange,
  isLoading = false,
}: YearNavigatorProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => onYearChange(year - 1)}
        disabled={isLoading}
        className="border-2 border-white bg-zinc-900 p-2 text-white hover:bg-zinc-800 hover:text-neonGreen transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-900 disabled:hover:text-white"
        aria-label="Previous year"
      >
        <ChevronLeft className="w-5 h-5" strokeWidth={2} />
      </button>

      <span className="font-heading text-lg md:text-xl text-white min-w-[100px] text-center">
        {year}
      </span>

      <button
        type="button"
        onClick={() => onYearChange(year + 1)}
        disabled={isLoading}
        className="border-2 border-white bg-zinc-900 p-2 text-white hover:bg-zinc-800 hover:text-neonGreen transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-900 disabled:hover:text-white"
        aria-label="Next year"
      >
        <ChevronRight className="w-5 h-5" strokeWidth={2} />
      </button>
    </div>
  );
}
