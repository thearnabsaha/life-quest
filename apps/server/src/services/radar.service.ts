import { readDb } from '../lib/db';
import { calculateLevel } from '@life-quest/utils';
import type { RadarStat } from '@life-quest/types';

export interface SubCategoryRadarStat {
  subCategoryId: string;
  subCategoryName: string;
  categoryId: string;
  totalXP: number;
  level: number;
  streak: number;
  last7DaysXP: number;
  last30DaysXP: number;
  habitCount: number;
}

export interface CategoryWithSubRadar {
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  categoryColor: string | null;
  subCategories: SubCategoryRadarStat[];
}

export async function getRadarStats(
  userId: string,
  timeRange?: 'week' | 'month' | 'all'
): Promise<RadarStat[]> {
  const db = readDb();
  const categories = db.categories.filter((c) => c.userId === userId);
  const xpLogs = db.xpLogs.filter((l) => l.userId === userId);
  const habits = db.habits.filter((h) => h.userId === userId);

  const now = new Date();
  const cutoff = new Date();
  if (timeRange === 'week') {
    cutoff.setDate(cutoff.getDate() - 7);
  } else if (timeRange === 'month') {
    cutoff.setDate(cutoff.getDate() - 30);
  } else {
    cutoff.setFullYear(2000); // all time
  }

  return categories.map((cat) => {
    // All-time XP for this category
    const allTimeLogs = xpLogs.filter((l) => l.categoryId === cat.id);
    const totalXP = allTimeLogs.reduce((sum, l) => sum + l.amount, 0);

    // Time-filtered XP
    const filteredLogs = allTimeLogs.filter(
      (l) => new Date(l.createdAt) >= cutoff
    );
    const filteredXP = filteredLogs.reduce((sum, l) => sum + l.amount, 0);

    // Last 7 days XP
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const last7DaysXP = allTimeLogs
      .filter((l) => new Date(l.createdAt) >= weekAgo)
      .reduce((sum, l) => sum + l.amount, 0);

    // Last 30 days XP
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const last30DaysXP = allTimeLogs
      .filter((l) => new Date(l.createdAt) >= monthAgo)
      .reduce((sum, l) => sum + l.amount, 0);

    // Category-level derived from XP
    const level = calculateLevel(totalXP);

    // Max streak from habits in this category
    const categoryHabits = habits.filter((h) => h.categoryId === cat.id);
    const streak = categoryHabits.length > 0
      ? Math.max(0, ...categoryHabits.map((h) => h.streak))
      : 0;

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      categoryIcon: cat.icon,
      categoryColor: cat.color,
      totalXP,
      level,
      streak,
      last7DaysXP,
      last30DaysXP,
    };
  });
}

export async function getSubCategoryRadar(userId: string): Promise<CategoryWithSubRadar[]> {
  const db = readDb();
  const categories = db.categories.filter((c) => c.userId === userId);
  const subCategories = db.subCategories;
  const habits = db.habits.filter((h) => h.userId === userId);
  const completions = db.habitCompletions;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  return categories
    .map((cat) => {
      const catSubs = subCategories.filter((s) => s.categoryId === cat.id);
      if (catSubs.length === 0) return null;

      const subStats: SubCategoryRadarStat[] = catSubs.map((sub) => {
        // Find habits linked to this subcategory
        const subHabits = habits.filter((h) => h.subCategoryId === sub.id);
        const habitIds = new Set(subHabits.map((h) => h.id));

        // Get completions for these habits
        const subCompletions = completions.filter(
          (c) => habitIds.has(c.habitId) && c.completed
        );

        // Calculate XP from completions
        const totalXP = subCompletions.reduce((sum, c) => sum + c.xpAwarded, 0);
        const last7DaysXP = subCompletions
          .filter((c) => new Date(c.date) >= weekAgo)
          .reduce((sum, c) => sum + c.xpAwarded, 0);
        const last30DaysXP = subCompletions
          .filter((c) => new Date(c.date) >= monthAgo)
          .reduce((sum, c) => sum + c.xpAwarded, 0);

        const level = calculateLevel(totalXP);
        const streak = subHabits.length > 0
          ? Math.max(0, ...subHabits.map((h) => h.streak))
          : 0;

        return {
          subCategoryId: sub.id,
          subCategoryName: sub.name,
          categoryId: cat.id,
          totalXP,
          level,
          streak,
          last7DaysXP,
          last30DaysXP,
          habitCount: subHabits.length,
        };
      });

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        categoryColor: cat.color,
        subCategories: subStats,
      };
    })
    .filter((item): item is CategoryWithSubRadar => item !== null);
}
