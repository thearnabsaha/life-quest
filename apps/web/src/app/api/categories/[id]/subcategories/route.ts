import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as categoryService from '@/server/services/category.service';

export const POST = withDb(async (req: NextRequest, ctx) => {
  const userId = await getUserId(req);
  const { id } = await ctx.params;
  const body = await req.json();
  const sub = await categoryService.createSubCategory(userId, id, body);
  return NextResponse.json(sub, { status: 201 });
});
