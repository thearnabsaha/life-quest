import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as xpService from '@/server/services/xp.service';

export const POST = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const body = await req.json();
  const log = await xpService.logXP(userId, body);
  return NextResponse.json(log, { status: 201 });
});
