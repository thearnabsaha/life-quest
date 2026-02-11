import type { Request, Response, NextFunction } from 'express';
import * as shopService from '../services/shop.service';

export async function getShopItems(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await shopService.getShopItems(req.userId!);
    res.json(items);
  } catch (error) { next(error); }
}

export async function createShopItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, description, cost, category, rarity, imageUrl, refundable } = req.body;
    if (!name || cost == null) {
      res.status(400).json({ message: 'name and cost are required' });
      return;
    }
    const item = await shopService.createShopItem(req.userId!, {
      name, description, cost, category, rarity, imageUrl, refundable,
    });
    res.status(201).json(item);
  } catch (error) { next(error); }
}

export async function updateShopItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await shopService.updateShopItem(req.params.id, req.userId!, req.body);
    res.json(item);
  } catch (error) { next(error); }
}

export async function deleteShopItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await shopService.deleteShopItem(req.params.id, req.userId!);
    res.status(204).send();
  } catch (error) { next(error); }
}

export async function purchaseItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await shopService.purchaseItem(req.params.id, req.userId!);
    res.json(result);
  } catch (error) { next(error); }
}

export async function refundItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await shopService.refundItem(req.params.id, req.userId!);
    res.json(result);
  } catch (error) { next(error); }
}

export async function getRedemptionHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const logs = await shopService.getRedemptionHistory(req.userId!);
    res.json(logs);
  } catch (error) { next(error); }
}
