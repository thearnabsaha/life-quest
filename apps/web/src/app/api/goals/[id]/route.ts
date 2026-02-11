import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as goalService from '@/server/services/goal.service';

export const dynamic = 'force-dynamic';

export const PATCH = withDb(async (req: NextRequest, ctx) => {
  const userId = await getUserId(req);
  const { id } = await ctx.params;
  const body = await req.json();
  const goal = await goalService.updateGoal(id, userId, body);
  return NextResponse.json(goal);
});

export const DELETE = withDb(async (req: NextRequest, ctx) => {
  const userId = await getUserId(req);
  const { id } = await ctx.params;
  await goalService.deleteGoal(id, userId);
  return NextResponse.json({ message: 'Deleted' });
});
