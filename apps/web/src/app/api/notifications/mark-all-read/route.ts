import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as notificationService from '@/server/services/notification.service';

export const POST = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  await notificationService.markAllAsRead(userId);
  return NextResponse.json({ message: 'All marked as read' });
});
