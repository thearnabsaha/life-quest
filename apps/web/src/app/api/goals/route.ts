import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as goalService from '@/server/services/goal.service';

export const dynamic = 'force-dynamic';

export const GET = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const goals = await goalService.getUserGoals(userId);
  return NextResponse.json(goals);
});

export const POST = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const body = await req.json();
  const goal = await goalService.createGoal(userId, body);
  return NextResponse.json(goal, { status: 201 });
});
