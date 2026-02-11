import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as tableService from '@/server/services/table.service';

export const dynamic = 'force-dynamic';

// GET all rows for the user
export const GET = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const rows = await tableService.getRows(userId);
  return NextResponse.json(rows);
});

// POST create a new row
export const POST = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const body = await req.json();
  const row = await tableService.createRow(userId, body);
  return NextResponse.json(row, { status: 201 });
});
