import { readDb, writeDb, cuid } from '../db';
import { AppError } from '../api-utils';
import type { ShopItem, RedemptionLog } from '@life-quest/types';

export interface CreateShopItemData {
  name: string;
  description?: string | null;
  cost: number;
  category: 'ARTIFACT' | 'TITLE' | 'AVATAR' | 'CUSTOM';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
  imageUrl?: string | null;
  refundable?: boolean;
}

export interface UpdateShopItemData {
  name?: string;
  description?: string | null;
  cost?: number;
  category?: 'ARTIFACT' | 'TITLE' | 'AVATAR' | 'CUSTOM';
  rarity?: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
  imageUrl?: string | null;
  refundable?: boolean;
}

export async function getShopItems(userId: string): Promise<ShopItem[]> {
  const db = readDb();
  return db.shopItems
    .filter((item) => item.userId === userId)
    .sort((a, b) => a.cost - b.cost) as unknown as ShopItem[];
}

export async function createShopItem(userId: string, data: CreateShopItemData): Promise<ShopItem> {
  if (!data.name || data.cost == null || data.cost < 0) {
    throw new AppError(400, 'name and cost (>= 0) are required');
  }
  const db = readDb();
  const item = {
    id: cuid(),
    userId,
    name: data.name,
    description: data.description ?? null,
    cost: data.cost,
    category: data.category ?? 'CUSTOM',
    rarity: data.rarity ?? 'COMMON',
    imageUrl: data.imageUrl ?? null,
    isOwned: false,
    isRedeemed: false,
    refundable: data.refundable ?? true,
    createdAt: new Date().toISOString(),
  };
  db.shopItems.push(item);
  writeDb(db);
  return item as ShopItem;
}

export async function updateShopItem(
  itemId: string,
  userId: string,
  data: UpdateShopItemData
): Promise<ShopItem> {
  const db = readDb();
  const idx = db.shopItems.findIndex((i) => i.id === itemId && i.userId === userId);
  if (idx === -1) throw new AppError(404, 'Shop item not found');

  const item = db.shopItems[idx];
  if (data.name !== undefined) item.name = data.name;
  if (data.description !== undefined) item.description = data.description;
  if (data.cost !== undefined) item.cost = data.cost;
  if (data.category !== undefined) item.category = data.category;
  if (data.rarity !== undefined) item.rarity = data.rarity;
  if (data.imageUrl !== undefined) item.imageUrl = data.imageUrl;
  if (data.refundable !== undefined) item.refundable = data.refundable;
  db.shopItems[idx] = item;
  writeDb(db);
  return item as ShopItem;
}

export async function deleteShopItem(itemId: string, userId: string): Promise<void> {
  const db = readDb();
  const item = db.shopItems.find((i) => i.id === itemId && i.userId === userId);
  if (!item) throw new AppError(404, 'Shop item not found');

  db.shopItems = db.shopItems.filter((i) => i.id !== itemId);
  db.redemptionLogs = db.redemptionLogs.filter((r) => r.shopItemId !== itemId);
  writeDb(db);
}

export async function purchaseItem(itemId: string, userId: string): Promise<{ item: ShopItem; log: RedemptionLog }> {
  const db = readDb();
  const idx = db.shopItems.findIndex((i) => i.id === itemId && i.userId === userId);
  if (idx === -1) throw new AppError(404, 'Shop item not found');

  const item = db.shopItems[idx];
  if (item.isOwned) throw new AppError(400, 'Item already owned');

  const profile = db.profiles.find((p) => p.userId === userId);
  if (!profile) throw new AppError(404, 'Profile not found');
  if (profile.totalXP < item.cost) {
    throw new AppError(400, `Insufficient XP. Need ${item.cost}, have ${profile.totalXP}`);
  }

  const profileIdx = db.profiles.findIndex((p) => p.userId === userId);
  db.profiles[profileIdx].totalXP -= item.cost;

  item.isOwned = true;
  item.isRedeemed = true;
  db.shopItems[idx] = item;

  const log = {
    id: cuid(),
    userId,
    shopItemId: itemId,
    cost: item.cost,
    action: 'PURCHASE' as const,
    createdAt: new Date().toISOString(),
  };
  db.redemptionLogs.push(log);

  db.notifications.push({
    id: cuid(),
    userId,
    type: 'ARTIFACT_UNLOCK',
    title: `Purchased: ${item.name}`,
    message: `You spent ${item.cost} XP on ${item.name} (${item.rarity})`,
    read: false,
    createdAt: new Date().toISOString(),
  });

  writeDb(db);
  return { item: item as ShopItem, log: log as RedemptionLog };
}

export async function refundItem(itemId: string, userId: string): Promise<{ item: ShopItem; log: RedemptionLog }> {
  const db = readDb();
  const idx = db.shopItems.findIndex((i) => i.id === itemId && i.userId === userId);
  if (idx === -1) throw new AppError(404, 'Shop item not found');

  const item = db.shopItems[idx];
  if (!item.isOwned) throw new AppError(400, 'Item not owned');
  if (!item.refundable) throw new AppError(400, 'Item is not refundable');

  const profileIdx = db.profiles.findIndex((p) => p.userId === userId);
  if (profileIdx === -1) throw new AppError(404, 'Profile not found');
  db.profiles[profileIdx].totalXP += item.cost;

  item.isOwned = false;
  item.isRedeemed = false;
  db.shopItems[idx] = item;

  const log = {
    id: cuid(),
    userId,
    shopItemId: itemId,
    cost: item.cost,
    action: 'REFUND' as const,
    createdAt: new Date().toISOString(),
  };
  db.redemptionLogs.push(log);

  writeDb(db);
  return { item: item as ShopItem, log: log as RedemptionLog };
}

export async function getRedemptionHistory(userId: string): Promise<RedemptionLog[]> {
  const db = readDb();
  return db.redemptionLogs
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as unknown as RedemptionLog[];
}
