import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as categoryService from '@/server/services/category.service';

export const PATCH = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const body = await req.json();
  const categories = await categoryService.reorderCategories(userId, body.categoryIds);
  return NextResponse.json(categories);
});
