import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as categoryService from '@/server/services/category.service';

export const PATCH = withDb(async (req: NextRequest, ctx) => {
  const userId = await getUserId(req);
  const { id } = await ctx.params;
  const body = await req.json();
  const sub = await categoryService.updateSubCategory(userId, id, body);
  return NextResponse.json(sub);
});

export const DELETE = withDb(async (req: NextRequest, ctx) => {
  const userId = await getUserId(req);
  const { id } = await ctx.params;
  await categoryService.deleteSubCategory(userId, id);
  return NextResponse.json({ message: 'Deleted' });
});
