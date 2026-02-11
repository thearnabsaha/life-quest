import { readDb, writeDb, cuid } from '../db';
import { AppError } from '../api-utils';
import { calculateStreakBonus } from '@life-quest/utils';
import { logXP } from './xp.service';
import type { HabitType, Habit } from '@life-quest/types';

const VALID_HABIT_TYPES: HabitType[] = ['YES_NO', 'HOURS', 'MANUAL'];

export interface CreateHabitData {
  name: string;
  type: HabitType;
  xpReward?: number;
  categoryId?: string | null;
  subCategoryId?: string | null;
}

export interface UpdateHabitData {
  name?: string;
  type?: HabitType;
  xpReward?: number;
  isActive?: boolean;
  categoryId?: string | null;
  subCategoryId?: string | null;
}

export async function getUserHabits(userId: string): Promise<Habit[]> {
  const db = readDb();
  const habits = db.habits.filter((h) => h.userId === userId);
  return habits.map((h) => {
    const completions = db.habitCompletions
      .filter((c) => c.habitId === h.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return toHabitResponse(h, completions);
  });
}

export async function getHabit(habitId: string, userId: string): Promise<Habit> {
  const db = readDb();
  const habit = db.habits.find((h) => h.id === habitId && h.userId === userId);
  if (!habit) throw new AppError(404, 'Habit not found');

  const completions = db.habitCompletions.filter((c) => c.habitId === habitId);
  return toHabitResponse(habit, completions);
}

export async function createHabit(userId: string, data: CreateHabitData): Promise<Habit> {
  if (!VALID_HABIT_TYPES.includes(data.type)) {
    throw new AppError(400, `Invalid habit type. Must be one of: ${VALID_HABIT_TYPES.join(', ')}`);
  }

  const db = readDb();
  const habit = {
    id: cuid(),
    userId,
    name: data.name,
    type: data.type,
    xpReward: data.xpReward ?? 10,
    streak: 0,
    isActive: true,
    categoryId: data.categoryId ?? null,
    subCategoryId: data.subCategoryId ?? null,
    createdAt: new Date().toISOString(),
  };

  db.habits.push(habit);
  writeDb(db);
  return toHabitResponse(habit, []);
}

export async function updateHabit(
  habitId: string,
  userId: string,
  data: UpdateHabitData
): Promise<Habit> {
  const db = readDb();
  const idx = db.habits.findIndex((h) => h.id === habitId && h.userId === userId);
  if (idx === -1) throw new AppError(404, 'Habit not found');

  if (data.type !== undefined && !VALID_HABIT_TYPES.includes(data.type)) {
    throw new AppError(400, `Invalid habit type. Must be one of: ${VALID_HABIT_TYPES.join(', ')}`);
  }

  const habit = db.habits[idx];
  if (data.name !== undefined) habit.name = data.name;
  if (data.type !== undefined) habit.type = data.type;
  if (data.xpReward !== undefined) habit.xpReward = data.xpReward;
  if (data.isActive !== undefined) habit.isActive = data.isActive;
  if (data.categoryId !== undefined) habit.categoryId = data.categoryId;
  if (data.subCategoryId !== undefined) habit.subCategoryId = data.subCategoryId;
  db.habits[idx] = habit;
  writeDb(db);

  const completions = db.habitCompletions.filter((c) => c.habitId === habitId);
  return toHabitResponse(habit, completions);
}

export async function deleteHabit(habitId: string, userId: string): Promise<void> {
  const db = readDb();
  const habit = db.habits.find((h) => h.id === habitId && h.userId === userId);
  if (!habit) throw new AppError(404, 'Habit not found');

  db.habits = db.habits.filter((h) => h.id !== habitId);
  db.habitCompletions = db.habitCompletions.filter((c) => c.habitId !== habitId);
  writeDb(db);
}

export async function completeHabit(
  habitId: string,
  userId: string,
  date?: string,
  hoursLogged?: number
): Promise<Habit> {
  const db = readDb();
  const habitIdx = db.habits.findIndex((h) => h.id === habitId && h.userId === userId);
  if (habitIdx === -1) throw new AppError(404, 'Habit not found');

  const habit = db.habits[habitIdx];
  const targetDateStr = date ? date.split('T')[0] : new Date().toISOString().split('T')[0];

  const existing = db.habitCompletions.find(
    (c) => c.habitId === habitId && c.date.startsWith(targetDateStr)
  );
  if (existing?.completed) {
    const completions = db.habitCompletions.filter((c) => c.habitId === habitId);
    return toHabitResponse(habit, completions);
  }

  const completedCompletions = db.habitCompletions
    .filter((c) => c.habitId === habitId && c.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let newStreak = 1;
  if (completedCompletions.length > 0) {
    const lastDate = new Date(completedCompletions[0].date);
    const targetDate = new Date(targetDateStr);
    const daysDiff = Math.floor(
      (targetDate.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000)
    );
    if (daysDiff === 1) {
      newStreak = habit.streak + 1;
    } else if (daysDiff === 0) {
      const completions = db.habitCompletions.filter((c) => c.habitId === habitId);
      return toHabitResponse(habit, completions);
    }
  }

  const bonusXP = calculateStreakBonus(newStreak);
  const baseXP = habit.xpReward;
  let xpAwarded: number;
  if (habit.type === 'MANUAL' && hoursLogged != null && hoursLogged > 0) {
    xpAwarded = Math.round(hoursLogged);
  } else {
    const hoursMultiplier = habit.type === 'HOURS' && hoursLogged ? Math.min(hoursLogged, 8) : 1;
    xpAwarded = Math.round((baseXP + bonusXP) * hoursMultiplier);
  }

  if (existing) {
    const idx = db.habitCompletions.findIndex((c) => c.id === existing.id);
    db.habitCompletions[idx].completed = true;
    db.habitCompletions[idx].hoursLogged = hoursLogged ?? null;
    db.habitCompletions[idx].xpAwarded = xpAwarded;
  } else {
    db.habitCompletions.push({
      id: cuid(),
      habitId,
      date: targetDateStr,
      completed: true,
      hoursLogged: hoursLogged ?? null,
      xpAwarded,
    });
  }

  db.habits[habitIdx].streak = newStreak;
  writeDb(db);

  await logXP(userId, {
    amount: xpAwarded,
    type: newStreak > 1 ? 'STREAK' : 'AUTO',
    source: habit.name,
    categoryId: habit.categoryId ?? undefined,
  });

  const freshDb = readDb();
  const freshHabit = freshDb.habits.find((h) => h.id === habitId)!;
  const freshCompletions = freshDb.habitCompletions.filter((c) => c.habitId === habitId);
  return toHabitResponse(freshHabit, freshCompletions);
}

function toHabitResponse(
  h: { id: string; userId: string; name: string; type: string; xpReward: number; streak: number; isActive: boolean; categoryId?: string | null; subCategoryId?: string | null },
  completions: { id: string; habitId: string; date: string; completed: boolean; hoursLogged: number | null; xpAwarded: number }[]
): Habit {
  return {
    id: h.id,
    userId: h.userId,
    name: h.name,
    type: h.type as HabitType,
    xpReward: h.xpReward,
    streak: h.streak,
    isActive: h.isActive,
    categoryId: h.categoryId ?? null,
    subCategoryId: h.subCategoryId ?? null,
    completions: completions.map((c) => ({
      id: c.id,
      habitId: c.habitId,
      date: c.date.split('T')[0],
      completed: c.completed,
      hoursLogged: c.hoursLogged,
      xpAwarded: c.xpAwarded,
    })),
  };
}
