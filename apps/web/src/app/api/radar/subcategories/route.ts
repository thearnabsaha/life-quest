import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as radarService from '@/server/services/radar.service';

export const dynamic = 'force-dynamic';

export const GET = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const data = await radarService.getSubCategoryRadar(userId);
  return NextResponse.json(data);
});
