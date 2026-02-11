import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as notificationService from '@/server/services/notification.service';

export const dynamic = 'force-dynamic';

export const GET = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const count = await notificationService.getUnreadCount(userId);
  return NextResponse.json({ count });
});
