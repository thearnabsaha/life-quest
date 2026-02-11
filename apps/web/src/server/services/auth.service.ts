import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readDb, writeDb, cuid } from '../db';
import { AppError } from '../api-utils';
import type { User, Profile } from '@life-quest/types';

export type AuthResult = { token: string; user: User };

export async function register(
  email: string,
  password: string,
  displayName: string
): Promise<AuthResult> {
  const db = readDb();
  const existing = db.users.find((u) => u.email === email);
  if (existing) {
    throw new AppError(400, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const userId = cuid();
  const profileId = cuid();
  const now = new Date().toISOString();

  db.users.push({
    id: userId,
    email,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  });

  db.profiles.push({
    id: profileId,
    userId,
    displayName,
    avatarTier: 1,
    level: 1,
    totalXP: 0,
    rank: 'E',
    title: 'Novice',
    manualLevelOverride: null,
    manualXPOverride: null,
  });

  writeDb(db);

  const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me';
  const token = jwt.sign({ userId }, jwtSecret);
  const profile = db.profiles.find((p) => p.userId === userId)!;
  return {
    token,
    user: {
      id: userId,
      email,
      createdAt: now,
      profile: toProfileResponse(profile),
    },
  };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const db = readDb();
  const user = db.users.find((u) => u.email === email);
  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'Invalid email or password');
  }
  const profile = db.profiles.find((p) => p.userId === user.id);
  if (!profile) {
    throw new AppError(401, 'Invalid email or password');
  }
  const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me';
  const token = jwt.sign({ userId: user.id }, jwtSecret);
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      profile: toProfileResponse(profile),
    },
  };
}

export async function getMe(userId: string): Promise<User> {
  const db = readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  const profile = db.profiles.find((p) => p.userId === userId);
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    profile: profile ? toProfileResponse(profile) : null,
  };
}

function toProfileResponse(p: {
  id: string;
  userId: string;
  displayName: string;
  avatarTier: number;
  level: number;
  totalXP: number;
  rank: string;
  title: string;
  manualLevelOverride: number | null;
  manualXPOverride: number | null;
}): Profile {
  return {
    id: p.id,
    userId: p.userId,
    displayName: p.displayName,
    avatarTier: p.avatarTier,
    level: p.level,
    totalXP: p.totalXP,
    rank: p.rank as Profile['rank'],
    title: p.title,
    manualLevelOverride: p.manualLevelOverride,
    manualXPOverride: p.manualXPOverride,
  };
}
