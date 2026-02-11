import type { Request, Response, NextFunction } from 'express';
import * as xpService from '../services/xp.service';

export async function logXP(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const { amount, type, categoryId, source } = req.body;
    if (amount === undefined || !type) {
      res.status(400).json({ message: 'amount and type are required' });
      return;
    }
    const xpLog = await xpService.logXP(userId, {
      amount: Number(amount),
      type,
      categoryId,
      source,
    });
    res.status(201).json(xpLog);
  } catch (error) {
    next(error);
  }
}

export async function getXPLogs(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await xpService.getXPLogs(userId, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateXPLog(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const { amount, type, categoryId, source } = req.body;
    const xpLog = await xpService.updateXPLog(id, userId, {
      amount: amount !== undefined ? Number(amount) : undefined,
      type,
      categoryId,
      source,
    });
    res.json(xpLog);
  } catch (error) {
    next(error);
  }
}
