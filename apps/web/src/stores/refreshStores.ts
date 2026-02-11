/**
 * Cross-store refresh utility.
 * After any mutation that awards XP (habit completion, XP logging, goal progress),
 * call refreshAfterXP() to keep all related stores in sync.
 */
import { useCalendarStore } from './useCalendarStore';
import { useXPStore } from './useXPStore';
import { useProfileStore } from './useProfileStore';

/**
 * Refresh calendar, XP logs, and profile after an XP-awarding action.
 * Uses Zustand's getState() to call actions from outside React components.
 * All fetches run in parallel; errors are silently caught.
 */
export function refreshAfterXP(): void {
  // Fire all refreshes in parallel — don't await, just let them run
  const calendarState = useCalendarStore.getState();
  const xpState = useXPStore.getState();
  const profileState = useProfileStore.getState();

  // Force fresh data (bypass staleness cache)
  calendarState.fetchCalendar(calendarState.year).catch(() => {});
  xpState.fetchLogs(1).catch(() => {});
  profileState.fetchProfile(true).catch(() => {});
}
