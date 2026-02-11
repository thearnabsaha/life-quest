import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as profileService from '@/server/services/profile.service';

export const dynamic = 'force-dynamic';

export const POST = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const profile = await profileService.resetProfile(userId);
  return NextResponse.json(profile);
});
