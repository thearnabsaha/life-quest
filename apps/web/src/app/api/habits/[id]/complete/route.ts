import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as habitService from '@/server/services/habit.service';

export const dynamic = 'force-dynamic';

export const POST = withDb(async (req: NextRequest, ctx) => {
  const userId = await getUserId(req);
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const habit = await habitService.completeHabit(id, userId, body.date, body.hoursLogged);
  return NextResponse.json(habit);
});

// DELETE = uncomplete a habit for a given date
export const DELETE = withDb(async (req: NextRequest, ctx) => {
  const userId = await getUserId(req);
  const { id } = await ctx.params;
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const habit = await habitService.uncompleteHabit(id, userId, date);
  return NextResponse.json(habit);
});
