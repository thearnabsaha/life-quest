import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as xpService from '@/server/services/xp.service';

export const dynamic = 'force-dynamic';

export const POST = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  await xpService.clearXPHistory(userId);
  return NextResponse.json({ message: 'All XP history cleared' });
});
