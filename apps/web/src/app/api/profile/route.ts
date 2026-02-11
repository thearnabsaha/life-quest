import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as profileService from '@/server/services/profile.service';

export const dynamic = 'force-dynamic';

export const GET = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const profile = await profileService.getProfile(userId);
  return NextResponse.json(profile);
});

export const PATCH = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const body = await req.json();
  const profile = await profileService.updateProfile(userId, body);
  return NextResponse.json(profile);
});
