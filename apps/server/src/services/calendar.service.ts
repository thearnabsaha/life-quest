import { readDb } from '../lib/db';
import type { CalendarEntry } from '@life-quest/types';

export async function getCalendarData(
  userId: string,
  year: number
): Promise<CalendarEntry[]> {
  const db = readDb();
  const yearStr = String(year);

  return db.calendarEntries
    .filter((e) => e.userId === userId && e.date.startsWith(yearStr))
    .map((e) => ({
      id: e.id,
      userId: e.userId,
      date: e.date,
      totalXP: e.totalXP,
      activities: e.activities,
    }));
}
