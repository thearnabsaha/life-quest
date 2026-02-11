import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as tableService from '@/server/services/table.service';

export const dynamic = 'force-dynamic';

/**
 * Batch endpoint: returns both columns and rows in a single request.
 */
export const GET = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const [columns, rows] = await Promise.all([
    tableService.getColumns(userId),
    tableService.getRows(userId),
  ]);
  return NextResponse.json({ columns, rows });
});
