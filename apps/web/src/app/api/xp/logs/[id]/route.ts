import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as xpService from '@/server/services/xp.service';

export const PATCH = withDb(async (req: NextRequest, ctx) => {
  const userId = await getUserId(req);
  const { id } = await ctx.params;
  const body = await req.json();
  const log = await xpService.updateXPLog(id, userId, body);
  return NextResponse.json(log);
});
