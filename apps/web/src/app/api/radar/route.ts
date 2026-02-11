import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as radarService from '@/server/services/radar.service';

export const dynamic = 'force-dynamic';

export const GET = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const url = new URL(req.url);
  const timeRange = (url.searchParams.get('range') || 'all') as 'week' | 'month' | 'all';
  const stats = await radarService.getRadarStats(userId, timeRange);
  return NextResponse.json(stats);
});
