import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as habitService from '@/server/services/habit.service';

export const dynamic = 'force-dynamic';

export const GET = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const habits = await habitService.getUserHabits(userId);
  return NextResponse.json(habits);
});

export const POST = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const body = await req.json();
  const habit = await habitService.createHabit(userId, {
    name: body.name,
    type: body.type,
    xpReward: body.xpReward,
    categoryId: body.categoryId,
    subCategoryId: body.subCategoryId,
  });
  return NextResponse.json(habit, { status: 201 });
});
