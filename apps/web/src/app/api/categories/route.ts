import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as categoryService from '@/server/services/category.service';

export const GET = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const categories = await categoryService.getUserCategories(userId);
  return NextResponse.json(categories);
});

export const POST = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const body = await req.json();
  const category = await categoryService.createCategory(userId, body);
  return NextResponse.json(category, { status: 201 });
});
