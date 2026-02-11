import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// ===== Types =====
export interface DbUser {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbProfile {
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
}

export interface DbCategory {
  id: string;
  userId: string;
  name: string;
  icon: string | null;
  color: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface DbSubCategory {
  id: string;
  categoryId: string;
  name: string;
  sortOrder: number;
}

export interface DbXPLog {
  id: string;
  userId: string;
  categoryId: string | null;
  amount: number;
  type: string;
  source: string | null;
  createdAt: string;
}

export interface DbHabit {
  id: string;
  userId: string;
  name: string;
  type: string;
  xpReward: number;
  streak: number;
  isActive: boolean;
  categoryId: string | null;
  subCategoryId: string | null;
  createdAt: string;
}

export interface DbHabitCompletion {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  hoursLogged: number | null;
  xpAwarded: number;
}

export interface DbCalendarEntry {
  id: string;
  userId: string;
  date: string;
  totalXP: number;
  activities: Record<string, unknown> | null;
}

export interface DbGoal {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  type: string; // LONG_TERM, SHORT_TERM
  status: string; // ACTIVE, COMPLETED, FAILED
  categoryId: string | null;
  targetValue: number;
  currentValue: number;
  xpReward: number;
  deadline: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface DbNotification {
  id: string;
  userId: string;
  type: string; // LEVEL_UP, STREAK, GOAL_COMPLETE, ARTIFACT_UNLOCK, REMINDER, SUMMARY
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface DbRulebookConfig {
  id: string;
  userId: string;
  mode: string; // AUTO or MANUAL
  xpLevelFormula: string; // e.g. "floor(sqrt(totalXP / 100))"
  levelRankMap: string; // JSON string of level->rank mapping
  rankTitles: string; // JSON string of rank->title mapping
  artifactThresholds: string; // JSON string
  statMultipliers: string; // JSON string
  updatedAt: string;
}

export interface DbShopItem {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  cost: number;
  category: string;
  rarity: string;
  imageUrl: string | null;
  isOwned: boolean;
  isRedeemed: boolean;
  refundable: boolean;
  createdAt: string;
}

export interface DbRedemptionLog {
  id: string;
  userId: string;
  shopItemId: string;
  cost: number;
  action: string;
  createdAt: string;
}

export interface Database {
  users: DbUser[];
  profiles: DbProfile[];
  categories: DbCategory[];
  subCategories: DbSubCategory[];
  xpLogs: DbXPLog[];
  habits: DbHabit[];
  habitCompletions: DbHabitCompletion[];
  calendarEntries: DbCalendarEntry[];
  goals: DbGoal[];
  notifications: DbNotification[];
  rulebookConfigs: DbRulebookConfig[];
  shopItems: DbShopItem[];
  redemptionLogs: DbRedemptionLog[];
}

// ===== Database file path =====
const DB_PATH = path.join(__dirname, '..', '..', 'data', 'db.json');

function ensureDataDir(): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function defaultDb(): Database {
  return {
    users: [],
    profiles: [],
    categories: [],
    subCategories: [],
    xpLogs: [],
    habits: [],
    habitCompletions: [],
    calendarEntries: [],
    goals: [],
    notifications: [],
    rulebookConfigs: [],
    shopItems: [],
    redemptionLogs: [],
  };
}

export function readDb(): Database {
  ensureDataDir();
  if (!fs.existsSync(DB_PATH)) {
    const db = defaultDb();
    writeDb(db);
    return db;
  }
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  const parsed = JSON.parse(raw) as Partial<Database>;
  const defaults = defaultDb();
  const merged = { ...defaults, ...parsed } as unknown as Record<string, unknown>;
  // Ensure all arrays exist even if db.json is from an older version
  for (const key of Object.keys(defaults)) {
    if (Array.isArray((defaults as unknown as Record<string, unknown>)[key]) && !Array.isArray(merged[key])) {
      merged[key] = [];
    }
  }
  return merged as unknown as Database;
}

export function writeDb(db: Database): void {
  ensureDataDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

export function cuid(): string {
  return 'c' + crypto.randomBytes(12).toString('hex');
}
