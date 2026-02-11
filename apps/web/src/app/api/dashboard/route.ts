import { NextRequest, NextResponse } from 'next/server';
import { withDb, getUserId } from '@/server/api-utils';
import * as profileService from '@/server/services/profile.service';
import * as xpService from '@/server/services/xp.service';
import * as categoryService from '@/server/services/category.service';
import * as habitService from '@/server/services/habit.service';
import * as calendarService from '@/server/services/calendar.service';
import * as goalService from '@/server/services/goal.service';
import * as notificationService from '@/server/services/notification.service';

export const dynamic = 'force-dynamic';

/**
 * Batch endpoint: returns all data needed for the dashboard in ONE request.
 * Replaces 8 individual API calls with a single serverless invocation.
 */
export const GET = withDb(async (req: NextRequest) => {
  const userId = await getUserId(req);
  const url = new URL(req.url);
  const year = parseInt(url.searchParams.get('year') || String(new Date().getFullYear()), 10);

  // All service calls share the same DB read (via AsyncLocalStorage)
  const [profile, xpLogs, categories, habits, calendar, goals, notifications, unreadCount] =
    await Promise.all([
      profileService.getProfile(userId),
      xpService.getXPLogs(userId, 1, 20),
      categoryService.getUserCategories(userId),
      habitService.getUserHabits(userId),
      calendarService.getCalendarData(userId, year),
      goalService.getUserGoals(userId),
      notificationService.getUserNotifications(userId, 20),
      notificationService.getUnreadCount(userId),
    ]);

  return NextResponse.json({
    profile,
    xpLogs,
    categories,
    habits,
    calendar,
    goals,
    notifications,
    unreadCount,
  });
});
