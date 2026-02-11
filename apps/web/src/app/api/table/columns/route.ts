import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as tableService from '@/server/services/table.service';

export const dynamic = 'force-dynamic';

// GET all columns for the user
export const GET = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const columns = await tableService.getColumns(userId);
  return NextResponse.json(columns);
});

// POST create a new column
export const POST = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const body = await req.json();
  const column = await tableService.createColumn(userId, body);
  return NextResponse.json(column, { status: 201 });
});
