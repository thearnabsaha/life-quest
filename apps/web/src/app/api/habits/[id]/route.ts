import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as habitService from '@/server/services/habit.service';

export const GET = withDb(async (req: NextRequest, ctx) => {
  const userId = await getUserId(req);
  const { id } = await ctx.params;
  const habit = await habitService.getHabit(id, userId);
  return NextResponse.json(habit);
});

export const PATCH = withDb(async (req: NextRequest, ctx) => {
  const userId = await getUserId(req);
  const { id } = await ctx.params;
  const body = await req.json();
  const updateData: Record<string, unknown> = {};
  if ('name' in body) updateData.name = body.name;
  if ('type' in body) updateData.type = body.type;
  if ('xpReward' in body) updateData.xpReward = body.xpReward;
  if ('isActive' in body) updateData.isActive = body.isActive;
  if ('categoryId' in body) updateData.categoryId = body.categoryId;
  if ('subCategoryId' in body) updateData.subCategoryId = body.subCategoryId;
  const habit = await habitService.updateHabit(id, userId, updateData as any);
  return NextResponse.json(habit);
});

export const DELETE = withDb(async (req: NextRequest, ctx) => {
  const userId = await getUserId(req);
  const { id } = await ctx.params;
  await habitService.deleteHabit(id, userId);
  return NextResponse.json({ message: 'Deleted' });
});
