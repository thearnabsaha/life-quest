import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as habitService from '@/server/services/habit.service';

export const POST = withDb(async (req: NextRequest, ctx) => {
  const userId = await getUserId(req);
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const habit = await habitService.completeHabit(id, userId, body.date, body.hoursLogged);
  return NextResponse.json(habit);
});
