import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as goalService from '@/server/services/goal.service';

export const dynamic = 'force-dynamic';

export const POST = withDb(async (req: NextRequest, ctx) => {
  const userId = await getUserId(req);
  const { id } = await ctx.params;
  const body = await req.json();
  const goal = await goalService.updateGoalProgress(id, userId, body.increment);
  return NextResponse.json(goal);
});
