import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as shopService from '@/server/services/shop.service';

export const dynamic = 'force-dynamic';

export const GET = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const history = await shopService.getRedemptionHistory(userId);
  return NextResponse.json(history);
});
