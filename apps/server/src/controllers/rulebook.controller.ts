import type { Request, Response, NextFunction } from 'express';
import * as rulebookService from '../services/rulebook.service';

export async function getRulebook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const config = await rulebookService.getRulebook(userId);
    res.json(config);
  } catch (error) {
    next(error);
  }
}

export async function updateRulebook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const data = req.body;
    const config = await rulebookService.updateRulebook(userId, data);
    res.json(config);
  } catch (error) {
    next(error);
  }
}

export async function resetRulebook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const config = await rulebookService.resetRulebook(userId);
    res.json(config);
  } catch (error) {
    next(error);
  }
}
