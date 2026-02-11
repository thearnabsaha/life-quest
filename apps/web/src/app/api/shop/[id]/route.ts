import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as shopService from '@/server/services/shop.service';

export const PATCH = withDb(async (req: NextRequest, ctx) => {
  const userId = await getUserId(req);
  const { id } = await ctx.params;
  const body = await req.json();
  const item = await shopService.updateShopItem(id, userId, body);
  return NextResponse.json(item);
});

export const DELETE = withDb(async (req: NextRequest, ctx) => {
  const userId = await getUserId(req);
  const { id } = await ctx.params;
  await shopService.deleteShopItem(id, userId);
  return NextResponse.json({ message: 'Deleted' });
});
