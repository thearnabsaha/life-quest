/**
 * Calculate bonus XP from streak length.
 * +5 XP per consecutive day, capped at 50 bonus.
 */
export function calculateStreakBonus(streak: number): number {
  return Math.min(streak * 5, 50);
}

/**
 * Determine if a streak is still active based on the last completion date.
 * A streak breaks if more than 1 day has passed.
 */
export function isStreakActive(lastCompletionDate: Date | string): boolean {
  const last = new Date(lastCompletionDate);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= 1.5; // Allow some buffer for timezone differences
}
