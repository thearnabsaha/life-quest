import type { Request, Response, NextFunction } from 'express';
import * as habitService from '../services/habit.service';

export async function getUserHabits(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const habits = await habitService.getUserHabits(userId);
    res.json(habits);
  } catch (error) {
    next(error);
  }
}

export async function getHabit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const habit = await habitService.getHabit(id, userId);
    res.json(habit);
  } catch (error) {
    next(error);
  }
}

export async function createHabit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const { name, type, xpReward, categoryId, subCategoryId } = req.body;
    if (!name || !type) {
      res.status(400).json({ message: 'name and type are required' });
      return;
    }
    const habit = await habitService.createHabit(userId, {
      name,
      type,
      xpReward,
      categoryId,
      subCategoryId,
    });
    res.status(201).json(habit);
  } catch (error) {
    next(error);
  }
}

export async function updateHabit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const body = req.body;
    const updateData: Record<string, unknown> = {};
    if ('name' in body) updateData.name = body.name;
    if ('type' in body) updateData.type = body.type;
    if ('xpReward' in body) updateData.xpReward = body.xpReward;
    if ('isActive' in body) updateData.isActive = body.isActive;
    if ('categoryId' in body) updateData.categoryId = body.categoryId;
    if ('subCategoryId' in body) updateData.subCategoryId = body.subCategoryId;
    const habit = await habitService.updateHabit(id, userId, updateData as habitService.UpdateHabitData);
    res.json(habit);
  } catch (error) {
    next(error);
  }
}

export async function deleteHabit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    await habitService.deleteHabit(id, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function completeHabit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const { date, hoursLogged } = req.body;
    const habit = await habitService.completeHabit(id, userId, date, hoursLogged);
    res.json(habit);
  } catch (error) {
    next(error);
  }
}
