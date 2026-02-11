import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as rulebookService from '@/server/services/rulebook.service';

export const POST = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const rulebook = await rulebookService.resetRulebook(userId);
  return NextResponse.json(rulebook);
});
