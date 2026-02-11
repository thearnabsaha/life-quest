import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as shopService from '@/server/services/shop.service';

export const dynamic = 'force-dynamic';

export const GET = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const items = await shopService.getShopItems(userId);
  return NextResponse.json(items);
});

export const POST = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const body = await req.json();
  const item = await shopService.createShopItem(userId, body);
  return NextResponse.json(item, { status: 201 });
});
