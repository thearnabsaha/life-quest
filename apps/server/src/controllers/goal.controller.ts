import type { Request, Response, NextFunction } from 'express';
import * as goalService from '../services/goal.service';

export async function getUserGoals(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const goals = await goalService.getUserGoals(userId);
    res.json(goals);
  } catch (error) {
    next(error);
  }
}

export async function createGoal(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const { title, description, type, targetValue, xpReward, categoryId, deadline } =
      req.body;
    if (!title || !type) {
      res.status(400).json({ message: 'title and type are required' });
      return;
    }
    const goal = await goalService.createGoal(userId, {
      title,
      description,
      type,
      targetValue: targetValue ?? 1,
      xpReward: xpReward ?? 0,
      categoryId,
      deadline,
    });
    res.status(201).json(goal);
  } catch (error) {
    next(error);
  }
}

export async function updateGoal(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const { title, description, type, status, categoryId, targetValue, currentValue, xpReward, deadline } =
      req.body;
    const goal = await goalService.updateGoal(id, userId, {
      title,
      description,
      type,
      status,
      categoryId,
      targetValue,
      currentValue,
      xpReward,
      deadline,
    });
    res.json(goal);
  } catch (error) {
    next(error);
  }
}

export async function deleteGoal(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    await goalService.deleteGoal(id, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function updateGoalProgress(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const { increment } = req.body;
    if (typeof increment !== 'number' || increment <= 0) {
      res.status(400).json({ message: 'increment must be a positive number' });
      return;
    }
    const goal = await goalService.updateGoalProgress(id, userId, increment);
    res.json(goal);
  } catch (error) {
    next(error);
  }
}
