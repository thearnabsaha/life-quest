/**
 * Format a date to YYYY-MM-DD string.
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * Get number of days between two dates.
 */
export function getDaysBetween(start: Date | string, end: Date | string): number {
  const s = new Date(start);
  const e = new Date(end);
  const diffMs = Math.abs(e.getTime() - s.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Generate an array of all dates in a year for the calendar heatmap.
 */
export function getCalendarDays(year: number): string[] {
  const days: string[] = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  const current = new Date(start);
  while (current <= end) {
    days.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}
