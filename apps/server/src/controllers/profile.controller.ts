import type { Request, Response, NextFunction } from 'express';
import * as profileService from '../services/profile.service';

export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const profile = await profileService.getProfile(userId);
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const { displayName, manualLevelOverride, manualXPOverride } = req.body;
    const profile = await profileService.updateProfile(userId, {
      displayName,
      manualLevelOverride,
      manualXPOverride,
    });
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

export async function resetProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const profile = await profileService.resetProfile(userId);
    res.json(profile);
  } catch (error) {
    next(error);
  }
}
