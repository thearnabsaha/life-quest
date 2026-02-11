import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as rulebookService from '@/server/services/rulebook.service';

export const dynamic = 'force-dynamic';

export const GET = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const rulebook = await rulebookService.getRulebook(userId);
  return NextResponse.json(rulebook);
});

export const PATCH = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const body = await req.json();
  const rulebook = await rulebookService.updateRulebook(userId, body);
  return NextResponse.json(rulebook);
});
