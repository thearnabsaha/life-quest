import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as xpService from '@/server/services/xp.service';

export const GET = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);
  const result = await xpService.getXPLogs(userId, page, limit);
  return NextResponse.json(result);
});
