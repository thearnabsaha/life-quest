import type { Request, Response, NextFunction } from 'express';
import * as notificationService from '../services/notification.service';

export async function getUserNotifications(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : undefined;
    const notifications = await notificationService.getUserNotifications(
      userId,
      limit
    );
    res.json(notifications);
  } catch (error) {
    next(error);
  }
}

export async function getUnreadCount(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const count = await notificationService.getUnreadCount(userId);
    res.json({ count });
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const notification = await notificationService.markAsRead(id, userId);
    res.json(notification);
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    await notificationService.markAllAsRead(userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
