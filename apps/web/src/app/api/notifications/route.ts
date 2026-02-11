import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as notificationService from '@/server/services/notification.service';

export const dynamic = 'force-dynamic';

export const GET = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const url = new URL(req.url);
  const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!, 10) : undefined;
  const notifications = await notificationService.getUserNotifications(userId, limit);
  return NextResponse.json(notifications);
});
