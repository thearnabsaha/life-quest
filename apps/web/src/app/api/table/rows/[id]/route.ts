import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as tableService from '@/server/services/table.service';

export const dynamic = 'force-dynamic';

// PATCH update a row
export const PATCH = withDb(async (req: NextRequest, ctx) => {
  const userId = await getUserId(req);
  const { id } = await ctx.params;
  const body = await req.json();
  const row = await tableService.updateRow(id, userId, body);
  return NextResponse.json(row);
});

// DELETE a row
export const DELETE = withDb(async (req: NextRequest, ctx) => {
  const userId = await getUserId(req);
  const { id } = await ctx.params;
  await tableService.deleteRow(id, userId);
  return NextResponse.json({ success: true });
});
