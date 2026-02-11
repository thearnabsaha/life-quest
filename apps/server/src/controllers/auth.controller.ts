import type { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password || !displayName) {
      res.status(400).json({ message: 'email, password, and displayName are required' });
      return;
    }
    const result = await authService.register(email, password, displayName);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'email and password are required' });
      return;
    }
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const user = await authService.getMe(userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
}
