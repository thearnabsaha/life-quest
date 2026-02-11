import crypto from 'crypto';
import { AsyncLocalStorage } from 'async_hooks';

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
  type: string;
  status: string;
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
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface DbRulebookConfig {
  id: string;
  userId: string;
  mode: string;
  xpLevelFormula: string;
  levelRankMap: string;
  rankTitles: string;
  artifactThresholds: string;
  statMultipliers: string;
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

// ===== Default empty database =====
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

// ===== Per-request isolation using AsyncLocalStorage =====
// Fixes concurrency bug where module-level _dbCache/_dirty was shared
// across concurrent requests in the same serverless function instance.
interface RequestDbContext {
  db: Database;
  dirty: boolean;
}

const requestStorage = new AsyncLocalStorage<RequestDbContext>();

// Legacy module-level fallback (for health endpoint / non-withDb callers)
let _dbCache: Database | null = null;
let _dirty = false;

// ===== Neon Postgres helpers (for production deployment) =====
async function loadFromPostgres(): Promise<Database> {
  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(process.env.DATABASE_URL!, { fetchOptions: { cache: 'no-store' } });
  // Ensure table exists
  await sql`
    CREATE TABLE IF NOT EXISTS app_data (
      id INTEGER PRIMARY KEY DEFAULT 1,
      data JSONB NOT NULL DEFAULT '{}'::jsonb
    )
  `;
  const result = await sql`SELECT data FROM app_data WHERE id = 1`;
  if (result.length === 0) {
    const db = defaultDb();
    await sql`INSERT INTO app_data (id, data) VALUES (1, ${JSON.stringify(db)}::jsonb)`;
    return db;
  }
  // Handle case where Neon might return JSONB as string or object
  let parsed: Partial<Database>;
  const rawData = result[0].data;
  if (typeof rawData === 'string') {
    try {
      parsed = JSON.parse(rawData) as Partial<Database>;
    } catch {
      console.error('[loadFromPostgres] Failed to parse data string, resetting to default');
      parsed = {};
    }
  } else if (rawData && typeof rawData === 'object') {
    parsed = rawData as Partial<Database>;
  } else {
    console.error('[loadFromPostgres] Unexpected data type:', typeof rawData);
    parsed = {};
  }
  const defaults = defaultDb();
  const merged = { ...defaults, ...parsed } as unknown as Record<string, unknown>;
  for (const key of Object.keys(defaults)) {
    if (Array.isArray((defaults as unknown as Record<string, unknown>)[key]) && !Array.isArray(merged[key])) {
      merged[key] = [];
    }
  }
  return merged as unknown as Database;
}

async function saveToPostgres(db: Database): Promise<void> {
  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(process.env.DATABASE_URL!, { fetchOptions: { cache: 'no-store' } });
  await sql`UPDATE app_data SET data = ${JSON.stringify(db)}::jsonb WHERE id = 1`;
}

// ===== JSON file helpers (for local development / Vercel tmp fallback) =====
function getFilePath(): string {
  const fs = require('fs');
  const path = require('path');
  // On Vercel, the filesystem is read-only except /tmp
  const baseDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data');
  const DB_PATH = path.join(baseDir, 'db.json');
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  return DB_PATH;
}

function readFromFile(): Database {
  const fs = require('fs');
  const dbPath = getFilePath();
  if (!fs.existsSync(dbPath)) {
    const db = defaultDb();
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
    return db;
  }
  const raw = fs.readFileSync(dbPath, 'utf-8');
  const parsed = JSON.parse(raw) as Partial<Database>;
  const defaults = defaultDb();
  const merged = { ...defaults, ...parsed } as unknown as Record<string, unknown>;
  for (const key of Object.keys(defaults)) {
    if (Array.isArray((defaults as unknown as Record<string, unknown>)[key]) && !Array.isArray(merged[key])) {
      merged[key] = [];
    }
  }
  return merged as unknown as Database;
}

function writeToFile(db: Database): void {
  const fs = require('fs');
  const dbPath = getFilePath();
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
}

// ===== Detect if we're using Postgres =====
function usePostgres(): boolean {
  return !!process.env.DATABASE_URL;
}

// ===== Public API (stays synchronous for service layer compatibility) =====

/**
 * Expose the AsyncLocalStorage so withDb can wrap handlers in run().
 */
export { requestStorage };

/**
 * Call at the start of each API request. Loads DB into memory.
 * Uses per-request context (AsyncLocalStorage) when available.
 */
export async function initDb(): Promise<void> {
  const db = usePostgres() ? await loadFromPostgres() : readFromFile();
  const ctx = requestStorage.getStore();
  if (ctx) {
    ctx.db = db;
    ctx.dirty = false;
  } else {
    // Legacy fallback (health endpoint, etc.)
    _dbCache = db;
    _dirty = false;
  }
}

/**
 * Call at the end of each API request. Flushes changes if dirty.
 * Uses per-request context when available.
 */
export async function flushDb(): Promise<void> {
  const ctx = requestStorage.getStore();
  if (ctx) {
    if (ctx.dirty && ctx.db) {
      if (usePostgres()) {
        await saveToPostgres(ctx.db);
      } else {
        writeToFile(ctx.db);
      }
      ctx.dirty = false;
    }
    return;
  }
  // Legacy fallback
  if (_dirty && _dbCache) {
    if (usePostgres()) {
      await saveToPostgres(_dbCache);
    } else {
      writeToFile(_dbCache);
    }
    _dirty = false;
  }
}

/**
 * Synchronous read. Uses per-request context when available.
 * In Postgres mode, returns the cached copy loaded by initDb().
 */
export function readDb(): Database {
  const ctx = requestStorage.getStore();
  if (ctx && ctx.db) return ctx.db;
  // Legacy fallback
  if (_dbCache) return _dbCache;
  if (!usePostgres()) {
    _dbCache = readFromFile();
    return _dbCache;
  }
  throw new Error('DB not initialized. Call initDb() first.');
}

/**
 * Synchronous write. Updates per-request cache and marks as dirty.
 */
export function writeDb(db: Database): void {
  const ctx = requestStorage.getStore();
  if (ctx) {
    ctx.db = db;
    ctx.dirty = true;
  } else {
    // Legacy fallback
    _dbCache = db;
    _dirty = true;
  }
  // In local file mode, also write immediately for safety
  if (!usePostgres()) {
    writeToFile(db);
  }
}

export function cuid(): string {
  return 'c' + crypto.randomBytes(12).toString('hex');
}
