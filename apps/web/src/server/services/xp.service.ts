import { readDb, writeDb, cuid } from '../db';
import { AppError } from '../api-utils';
import { calculateLevel, getRank } from '@life-quest/utils';
import type { XPType, XPLog } from '@life-quest/types';

const VALID_XP_TYPES: XPType[] = ['MANUAL', 'AUTO', 'BONUS', 'STREAK'];

export interface LogXPParams {
  amount: number;
  type: XPType;
  categoryId?: string;
  source?: string;
}

export async function logXP(userId: string, params: LogXPParams): Promise<XPLog> {
  if (!VALID_XP_TYPES.includes(params.type)) {
    throw new AppError(400, `Invalid XP type. Must be one of: ${VALID_XP_TYPES.join(', ')}`);
  }
  if (params.amount <= 0) {
    throw new AppError(400, 'Amount must be positive');
  }

  const db = readDb();

  if (params.categoryId) {
    const cat = db.categories.find((c) => c.id === params.categoryId && c.userId === userId);
    if (!cat) throw new AppError(404, 'Category not found');
  }

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const xpLog = {
    id: cuid(),
    userId,
    amount: params.amount,
    type: params.type,
    categoryId: params.categoryId ?? null,
    source: params.source ?? null,
    createdAt: now.toISOString(),
  };
  db.xpLogs.push(xpLog);

  const profileIdx = db.profiles.findIndex((p) => p.userId === userId);
  if (profileIdx === -1) throw new AppError(404, 'Profile not found');

  const profile = db.profiles[profileIdx];
  profile.totalXP += params.amount;
  profile.level = profile.manualLevelOverride ?? calculateLevel(profile.totalXP);
  profile.rank = getRank(profile.level);
  db.profiles[profileIdx] = profile;

  const calIdx = db.calendarEntries.findIndex(
    (e) => e.userId === userId && e.date === todayStr
  );
  if (calIdx !== -1) {
    db.calendarEntries[calIdx].totalXP += params.amount;
  } else {
    db.calendarEntries.push({
      id: cuid(),
      userId,
      date: todayStr,
      totalXP: params.amount,
      activities: null,
    });
  }

  writeDb(db);
  return toXPLogResponse(xpLog);
}

export async function getXPLogs(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ data: XPLog[]; total: number; page: number; limit: number }> {
  const db = readDb();
  const userLogs = db.xpLogs
    .filter((l) => l.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = userLogs.length;
  const skip = (page - 1) * limit;
  const paged = userLogs.slice(skip, skip + limit);

  return {
    data: paged.map(toXPLogResponse),
    total,
    page,
    limit,
  };
}

export interface UpdateXPLogData {
  amount?: number;
  type?: XPType;
  categoryId?: string | null;
  source?: string | null;
}

export async function updateXPLog(
  logId: string,
  userId: string,
  data: UpdateXPLogData
): Promise<XPLog> {
  const db = readDb();
  const idx = db.xpLogs.findIndex((l) => l.id === logId && l.userId === userId);
  if (idx === -1) throw new AppError(404, 'XP log not found');

  if (data.type !== undefined && !VALID_XP_TYPES.includes(data.type)) {
    throw new AppError(400, `Invalid XP type. Must be one of: ${VALID_XP_TYPES.join(', ')}`);
  }
  if (data.amount !== undefined && data.amount <= 0) {
    throw new AppError(400, 'Amount must be positive');
  }

  const log = db.xpLogs[idx];
  const delta = data.amount !== undefined ? data.amount - log.amount : 0;

  if (data.amount !== undefined) log.amount = data.amount;
  if (data.type !== undefined) log.type = data.type;
  if (data.categoryId !== undefined) log.categoryId = data.categoryId;
  if (data.source !== undefined) log.source = data.source;
  db.xpLogs[idx] = log;

  if (delta !== 0) {
    const profileIdx = db.profiles.findIndex((p) => p.userId === userId);
    if (profileIdx !== -1) {
      const profile = db.profiles[profileIdx];
      profile.totalXP += delta;
      profile.level = profile.manualLevelOverride ?? calculateLevel(profile.totalXP);
      profile.rank = getRank(profile.level);
      db.profiles[profileIdx] = profile;
    }

    const logDate = log.createdAt.split('T')[0];
    const calIdx = db.calendarEntries.findIndex(
      (e) => e.userId === userId && e.date === logDate
    );
    if (calIdx !== -1) {
      db.calendarEntries[calIdx].totalXP += delta;
    }
  }

  writeDb(db);
  return toXPLogResponse(log);
}

export async function deleteXPLog(logId: string, userId: string): Promise<void> {
  const db = readDb();
  const idx = db.xpLogs.findIndex((l) => l.id === logId && l.userId === userId);
  if (idx === -1) throw new AppError(404, 'XP log not found');

  const log = db.xpLogs[idx];
  const amount = log.amount;

  // Remove the log
  db.xpLogs.splice(idx, 1);

  // Subtract XP from profile
  const profileIdx = db.profiles.findIndex((p) => p.userId === userId);
  if (profileIdx !== -1) {
    const profile = db.profiles[profileIdx];
    profile.totalXP = Math.max(0, profile.totalXP - amount);
    profile.level = profile.manualLevelOverride ?? calculateLevel(profile.totalXP);
    profile.rank = getRank(profile.level);
    db.profiles[profileIdx] = profile;
  }

  // Subtract XP from calendar entry
  const logDate = log.createdAt.split('T')[0];
  const calIdx = db.calendarEntries.findIndex(
    (e) => e.userId === userId && e.date === logDate
  );
  if (calIdx !== -1) {
    db.calendarEntries[calIdx].totalXP = Math.max(0, db.calendarEntries[calIdx].totalXP - amount);
    // Remove entry if XP drops to 0
    if (db.calendarEntries[calIdx].totalXP <= 0) {
      db.calendarEntries.splice(calIdx, 1);
    }
  }

  writeDb(db);
}

export async function clearXPHistory(userId: string): Promise<void> {
  const db = readDb();

  // Remove all XP logs for this user
  db.xpLogs = db.xpLogs.filter((l) => l.userId !== userId);

  // Remove all calendar entries for this user
  db.calendarEntries = db.calendarEntries.filter((e) => e.userId !== userId);

  // Reset profile XP, level, rank
  const profileIdx = db.profiles.findIndex((p) => p.userId === userId);
  if (profileIdx !== -1) {
    const profile = db.profiles[profileIdx];
    profile.totalXP = 0;
    profile.level = 1;
    profile.rank = 'E';
    profile.manualLevelOverride = null;
    profile.manualXPOverride = null;
    db.profiles[profileIdx] = profile;
  }

  // Reset all habit streaks and remove completions
  db.habits.forEach((h) => {
    if (h.userId === userId) h.streak = 0;
  });
  db.habitCompletions = db.habitCompletions.filter((c) => {
    const habit = db.habits.find((h) => h.id === c.habitId);
    return !habit || habit.userId !== userId;
  });

  writeDb(db);
}

function toXPLogResponse(l: {
  id: string;
  userId: string;
  categoryId: string | null;
  amount: number;
  type: string;
  source: string | null;
  createdAt: string;
}): XPLog {
  return {
    id: l.id,
    userId: l.userId,
    categoryId: l.categoryId,
    amount: l.amount,
    type: l.type as XPType,
    source: l.source,
    createdAt: l.createdAt,
  };
}
