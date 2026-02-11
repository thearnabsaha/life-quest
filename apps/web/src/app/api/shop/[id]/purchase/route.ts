import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as shopService from '@/server/services/shop.service';

export const POST = withDb(async (req: NextRequest, ctx) => {
  const userId = await getUserId(req);
  const { id } = await ctx.params;
  const result = await shopService.purchaseItem(id, userId);
  return NextResponse.json(result);
});
