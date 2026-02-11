import { readDb, writeDb, cuid } from '../lib/db';
import { AppError } from '../middleware/errorHandler';
import type { Notification, NotificationType } from '@life-quest/types';

const VALID_TYPES: NotificationType[] = [
  'LEVEL_UP',
  'STREAK',
  'GOAL_COMPLETE',
  'ARTIFACT_UNLOCK',
  'REMINDER',
  'SUMMARY',
];

export async function getUserNotifications(
  userId: string,
  limit?: number
): Promise<Notification[]> {
  const db = readDb();
  const notifications = db.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const result = limit ? notifications.slice(0, limit) : notifications;
  return result.map(toNotificationResponse);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const db = readDb();
  return db.notifications.filter((n) => n.userId === userId && !n.read).length;
}

export async function markAsRead(
  id: string,
  userId: string
): Promise<Notification> {
  const db = readDb();
  const idx = db.notifications.findIndex(
    (n) => n.id === id && n.userId === userId
  );
  if (idx === -1) throw new AppError(404, 'Notification not found');

  db.notifications[idx].read = true;
  writeDb(db);
  return toNotificationResponse(db.notifications[idx]);
}

export async function markAllAsRead(userId: string): Promise<void> {
  const db = readDb();
  for (const n of db.notifications) {
    if (n.userId === userId && !n.read) n.read = true;
  }
  writeDb(db);
}

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string
): Promise<Notification> {
  if (!VALID_TYPES.includes(type)) {
    throw new AppError(400, `Invalid notification type: ${type}`);
  }

  const db = readDb();
  const now = new Date().toISOString();
  const notification = {
    id: cuid(),
    userId,
    type,
    title,
    message,
    read: false,
    createdAt: now,
  };

  db.notifications.push(notification);
  writeDb(db);
  return toNotificationResponse(notification);
}

function toNotificationResponse(n: {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}): Notification {
  return {
    id: n.id,
    userId: n.userId,
    type: n.type as NotificationType,
    title: n.title,
    message: n.message,
    read: n.read,
    createdAt: n.createdAt,
  };
}
