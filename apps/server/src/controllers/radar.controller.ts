import type { Request, Response, NextFunction } from 'express';
import * as radarService from '../services/radar.service';

export async function getRadarStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const range = req.query.range as 'week' | 'month' | 'all' | undefined;
    const stats = await radarService.getRadarStats(req.userId!, range ?? 'all');
    res.json(stats);
  } catch (error) { next(error); }
}

export async function getSubCategoryRadar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await radarService.getSubCategoryRadar(req.userId!);
    res.json(data);
  } catch (error) { next(error); }
}
