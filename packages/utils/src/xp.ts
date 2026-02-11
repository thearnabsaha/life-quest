/**
 * Calculate level from total XP.
 * Formula: Level = floor(sqrt(totalXP / 100)), minimum 1
 */
export function calculateLevel(totalXP: number): number {
  return Math.max(1, Math.floor(Math.sqrt(totalXP / 100)));
}

/**
 * Calculate total XP required to reach the next level.
 */
export function xpForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel + 1, 2) * 100;
}

/**
 * Get the XP progress percentage within the current level (0-100).
 */
export function xpProgressPercent(totalXP: number): number {
  const currentLevel = calculateLevel(totalXP);
  const currentLevelXP = Math.pow(currentLevel, 2) * 100;
  const nextLevelXP = xpForNextLevel(currentLevel);
  const progress = ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  return Math.min(100, Math.max(0, progress));
}
