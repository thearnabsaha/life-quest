import type { Request, Response, NextFunction } from 'express';
import * as aiService from '../services/ai.service';

export async function chat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ message: 'message (string) is required' });
      return;
    }

    const result = await aiService.chat(userId, message, history);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
