import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as notificationService from '@/server/services/notification.service';

export const dynamic = 'force-dynamic';

export const PATCH = withDb(async (req: NextRequest, ctx) => {
  const userId = await getUserId(req);
  const { id } = await ctx.params;
  const notification = await notificationService.markAsRead(id, userId);
  return NextResponse.json(notification);
});
