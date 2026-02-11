import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as calendarService from '@/server/services/calendar.service';

export const GET = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const url = new URL(req.url);
  const year = parseInt(url.searchParams.get('year') || String(new Date().getFullYear()), 10);
  const data = await calendarService.getCalendarData(userId, year);
  return NextResponse.json(data);
});
