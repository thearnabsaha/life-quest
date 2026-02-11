import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as aiService from '@/server/services/ai.service';

export const dynamic = 'force-dynamic';

export const POST = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const body = await req.json();
  const result = await aiService.chat(userId, body.message, body.history);
  return NextResponse.json(result);
});
