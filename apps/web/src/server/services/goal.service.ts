import { readDb, writeDb, cuid } from '../db';
import { AppError } from '../api-utils';
import { logXP } from './xp.service';
import { createNotification } from './notification.service';
import type { Goal, GoalType, GoalStatus } from '@life-quest/types';

const VALID_GOAL_TYPES: GoalType[] = ['LONG_TERM', 'SHORT_TERM'];
const VALID_STATUSES: GoalStatus[] = ['ACTIVE', 'COMPLETED', 'FAILED'];

export interface CreateGoalData {
  title: string;
  description?: string | null;
  type: GoalType;
  targetValue: number;
  xpReward: number;
  categoryId?: string | null;
  deadline?: string | null;
}

export interface UpdateGoalData {
  title?: string;
  description?: string | null;
  type?: GoalType;
  status?: GoalStatus;
  categoryId?: string | null;
  targetValue?: number;
  currentValue?: number;
  xpReward?: number;
  deadline?: string | null;
}

export async function getUserGoals(userId: string): Promise<Goal[]> {
  const db = readDb();
  const goals = db.goals
    .filter((g) => g.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return goals.map(toGoalResponse);
}

export async function createGoal(userId: string, data: CreateGoalData): Promise<Goal> {
  if (!data.title?.trim()) {
    throw new AppError(400, 'Title is required');
  }
  if (!VALID_GOAL_TYPES.includes(data.type)) {
    throw new AppError(400, `Invalid goal type. Must be one of: ${VALID_GOAL_TYPES.join(', ')}`);
  }
  if (data.targetValue == null || data.targetValue < 0) {
    throw new AppError(400, 'Target value must be a non-negative number');
  }
  if (data.xpReward == null || data.xpReward < 0) {
    throw new AppError(400, 'XP reward must be a non-negative number');
  }

  const db = readDb();

  if (data.categoryId) {
    const cat = db.categories.find((c) => c.id === data.categoryId && c.userId === userId);
    if (!cat) throw new AppError(404, 'Category not found');
  }

  const now = new Date().toISOString();
  const goal = {
    id: cuid(),
    userId,
    title: data.title.trim(),
    description: data.description?.trim() ?? null,
    type: data.type,
    status: 'ACTIVE' as const,
    categoryId: data.categoryId ?? null,
    targetValue: data.targetValue,
    currentValue: 0,
    xpReward: data.xpReward ?? 0,
    deadline: data.deadline ?? null,
    createdAt: now,
    completedAt: null,
  };

  db.goals.push(goal);
  writeDb(db);
  return toGoalResponse(goal);
}

export async function updateGoal(
  goalId: string,
  userId: string,
  data: UpdateGoalData
): Promise<Goal> {
  const db = readDb();
  const idx = db.goals.findIndex((g) => g.id === goalId && g.userId === userId);
  if (idx === -1) throw new AppError(404, 'Goal not found');

  if (data.type !== undefined && !VALID_GOAL_TYPES.includes(data.type)) {
    throw new AppError(400, `Invalid goal type. Must be one of: ${VALID_GOAL_TYPES.join(', ')}`);
  }
  if (data.status !== undefined && !VALID_STATUSES.includes(data.status)) {
    throw new AppError(400, `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  if (data.categoryId) {
    const cat = db.categories.find((c) => c.id === data.categoryId && c.userId === userId);
    if (!cat) throw new AppError(404, 'Category not found');
  }

  const goal = db.goals[idx];
  if (data.title !== undefined) goal.title = data.title.trim();
  if (data.description !== undefined) goal.description = data.description?.trim() ?? null;
  if (data.type !== undefined) goal.type = data.type;
  if (data.status !== undefined) goal.status = data.status;
  if (data.categoryId !== undefined) goal.categoryId = data.categoryId;
  if (data.targetValue !== undefined) goal.targetValue = data.targetValue;
  if (data.currentValue !== undefined) goal.currentValue = data.currentValue;
  if (data.xpReward !== undefined) goal.xpReward = data.xpReward;
  if (data.deadline !== undefined) goal.deadline = data.deadline ?? null;

  if (data.status === 'COMPLETED' && !goal.completedAt) {
    goal.completedAt = new Date().toISOString();
  } else if (data.status !== 'COMPLETED') {
    goal.completedAt = null;
  }

  db.goals[idx] = goal;
  writeDb(db);
  return toGoalResponse(goal);
}

export async function deleteGoal(goalId: string, userId: string): Promise<void> {
  const db = readDb();
  const goal = db.goals.find((g) => g.id === goalId && g.userId === userId);
  if (!goal) throw new AppError(404, 'Goal not found');

  db.goals = db.goals.filter((g) => g.id !== goalId);
  writeDb(db);
}

export async function updateGoalProgress(
  goalId: string,
  userId: string,
  increment: number
): Promise<Goal> {
  if (increment <= 0) {
    throw new AppError(400, 'Increment must be positive');
  }

  const db = readDb();
  const idx = db.goals.findIndex((g) => g.id === goalId && g.userId === userId);
  if (idx === -1) throw new AppError(404, 'Goal not found');

  const goal = db.goals[idx];
  if (goal.status !== 'ACTIVE') {
    throw new AppError(400, 'Cannot update progress on a completed or failed goal');
  }

  goal.currentValue = Math.min(goal.currentValue + increment, goal.targetValue);
  const now = new Date().toISOString();

  if (goal.currentValue >= goal.targetValue) {
    goal.status = 'COMPLETED';
    goal.completedAt = now;

    await logXP(userId, {
      amount: goal.xpReward,
      type: 'BONUS',
      categoryId: goal.categoryId ?? undefined,
      source: `Goal: ${goal.title}`,
    });

    await createNotification(userId, 'GOAL_COMPLETE', `Goal Complete: ${goal.title}`, `You earned ${goal.xpReward} XP for completing "${goal.title}"!`);
  }

  db.goals[idx] = goal;
  writeDb(db);
  return toGoalResponse(goal);
}

function toGoalResponse(g: {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  categoryId: string | null;
  targetValue: number;
  currentValue: number;
  xpReward: number;
  deadline: string | null;
  createdAt: string;
  completedAt: string | null;
}): Goal {
  return {
    id: g.id,
    userId: g.userId,
    title: g.title,
    description: g.description,
    type: g.type as GoalType,
    status: g.status as GoalStatus,
    categoryId: g.categoryId,
    targetValue: g.targetValue,
    currentValue: g.currentValue,
    xpReward: g.xpReward,
    deadline: g.deadline,
    createdAt: g.createdAt,
    completedAt: g.completedAt,
  };
}
