import { readDb, writeDb } from '../lib/db';
import { AppError } from '../middleware/errorHandler';
import type { Profile } from '@life-quest/types';
import { calculateLevel, getRank } from '@life-quest/utils';

export interface ProfileUpdateData {
  displayName?: string;
  manualLevelOverride?: number | null;
  manualXPOverride?: number | null;
}

export async function getProfile(userId: string): Promise<Profile> {
  const db = readDb();
  const profile = db.profiles.find((p) => p.userId === userId);
  if (!profile) {
    throw new AppError(404, 'Profile not found');
  }
  return toProfileResponse(profile);
}

export async function updateProfile(
  userId: string,
  data: ProfileUpdateData
): Promise<Profile> {
  const db = readDb();
  const idx = db.profiles.findIndex((p) => p.userId === userId);
  if (idx === -1) {
    throw new AppError(404, 'Profile not found');
  }

  const profile = db.profiles[idx];

  if (data.displayName !== undefined) profile.displayName = data.displayName;
  if (data.manualLevelOverride !== undefined) profile.manualLevelOverride = data.manualLevelOverride;
  if (data.manualXPOverride !== undefined) profile.manualXPOverride = data.manualXPOverride;

  if (data.manualLevelOverride !== undefined || data.manualXPOverride !== undefined) {
    const totalXP = profile.manualXPOverride ?? profile.totalXP;
    const level = profile.manualLevelOverride ?? calculateLevel(totalXP);
    const rank = getRank(level);
    const title = getTitleForLevel(level);
    profile.level = level;
    profile.rank = rank;
    profile.title = title;
  }

  db.profiles[idx] = profile;
  writeDb(db);
  return toProfileResponse(profile);
}

export async function resetProfile(userId: string): Promise<Profile> {
  const db = readDb();
  const profileIdx = db.profiles.findIndex((p) => p.userId === userId);
  if (profileIdx === -1) {
    throw new AppError(404, 'Profile not found');
  }

  // Reset profile to fresh state
  const profile = db.profiles[profileIdx];
  profile.totalXP = 0;
  profile.level = 1;
  profile.rank = 'E';
  profile.title = 'Novice';
  profile.avatarTier = 0;
  profile.manualLevelOverride = null;
  profile.manualXPOverride = null;
  db.profiles[profileIdx] = profile;

  // Remove all user data except the user account and profile
  db.categories = db.categories.filter((c) => c.userId !== userId);
  db.subCategories = db.subCategories.filter((s) => {
    // Keep subcategories only for categories that still exist
    return db.categories.some((c) => c.id === s.categoryId);
  });
  db.xpLogs = db.xpLogs.filter((l) => l.userId !== userId);
  db.habits = db.habits.filter((h) => h.userId !== userId);
  db.habitCompletions = db.habitCompletions.filter((hc) => {
    return db.habits.some((h) => h.id === hc.habitId);
  });
  db.calendarEntries = db.calendarEntries.filter((e) => e.userId !== userId);
  db.goals = db.goals.filter((g) => g.userId !== userId);
  db.notifications = db.notifications.filter((n) => n.userId !== userId);
  db.rulebookConfigs = db.rulebookConfigs.filter((r) => r.userId !== userId);
  db.shopItems = db.shopItems.filter((s) => s.userId !== userId);
  db.redemptionLogs = db.redemptionLogs.filter((r) => r.userId !== userId);

  writeDb(db);
  return toProfileResponse(profile);
}

function getTitleForLevel(level: number): string {
  if (level >= 100) return 'Legend';
  if (level >= 80) return 'Master';
  if (level >= 60) return 'Expert';
  if (level >= 45) return 'Veteran';
  if (level >= 30) return 'Adventurer';
  if (level >= 20) return 'Rising Star';
  if (level >= 10) return 'Aspiring';
  return 'Novice';
}

function toProfileResponse(p: {
  id: string;
  userId: string;
  displayName: string;
  avatarTier: number;
  level: number;
  totalXP: number;
  rank: string;
  title: string;
  manualLevelOverride: number | null;
  manualXPOverride: number | null;
}): Profile {
  return {
    id: p.id,
    userId: p.userId,
    displayName: p.displayName,
    avatarTier: p.avatarTier,
    level: p.level,
    totalXP: p.totalXP,
    rank: p.rank as Profile['rank'],
    title: p.title,
    manualLevelOverride: p.manualLevelOverride,
    manualXPOverride: p.manualXPOverride,
  };
}
