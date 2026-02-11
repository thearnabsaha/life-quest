import type { Request, Response, NextFunction } from 'express';
import * as calendarService from '../services/calendar.service';

export async function getCalendarData(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const entries = await calendarService.getCalendarData(userId, year);
    res.json(entries);
  } catch (error) {
    next(error);
  }
}
