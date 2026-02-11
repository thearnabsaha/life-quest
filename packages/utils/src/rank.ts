import type { Rank } from '@life-quest/types';

export const RANK_ORDER: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];

/**
 * Get the rank string for a given level.
 */
export function getRank(level: number): Rank {
  if (level >= 100) return 'SSS';
  if (level >= 80) return 'SS';
  if (level >= 60) return 'S';
  if (level >= 45) return 'A';
  if (level >= 30) return 'B';
  if (level >= 20) return 'C';
  if (level >= 10) return 'D';
  return 'E';
}
