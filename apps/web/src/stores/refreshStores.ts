/**
 * Cross-store refresh utility.
 * After any mutation that awards XP (habit completion, goal progress),
 * call refreshAfterXP() to keep calendar and profile in sync.
 */
import { useCalendarStore } from './useCalendarStore';
import { useProfileStore } from './useProfileStore';

/**
 * Refresh calendar and profile after an XP-awarding action.
 * XP logs are NOT refreshed here — they only matter on the XP page
 * and will be fetched when the user navigates there.
 * This reduces 3 API calls down to 2 per XP-awarding action.
 */
export function refreshAfterXP(): void {
  const calendarState = useCalendarStore.getState();
  const profileState = useProfileStore.getState();

  calendarState.fetchCalendar(calendarState.year).catch(() => {});
  profileState.fetchProfile(true).catch(() => {});
}
