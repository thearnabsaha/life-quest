import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as tableService from '@/server/services/table.service';

export const dynamic = 'force-dynamic';

// PATCH update a column
export const PATCH = withDb(async (req: NextRequest, ctx) => {
  const userId = await getUserId(req);
  const { id } = await ctx.params;
  const body = await req.json();
  const column = await tableService.updateColumn(id, userId, body);
  return NextResponse.json(column);
});

// DELETE a column
export const DELETE = withDb(async (req: NextRequest, ctx) => {
  const userId = await getUserId(req);
  const { id } = await ctx.params;
  await tableService.deleteColumn(id, userId);
  return NextResponse.json({ success: true });
});
