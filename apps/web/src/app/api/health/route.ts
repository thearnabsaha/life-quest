import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, unknown> = {};

  // 1. Check env vars
  // Show partial DATABASE_URL to confirm both envs point to the same DB
  const dbUrl = process.env.DATABASE_URL || '';
  // Show host portion of the URL for comparison
  let dbHost = 'MISSING';
  try {
    const u = new URL(dbUrl);
    dbHost = u.host;
  } catch { dbHost = dbUrl ? 'parse-error' : 'MISSING'; }
  checks.env = {
    JWT_SECRET: !!process.env.JWT_SECRET ? 'SET' : 'MISSING',
    GROQ_API_KEY: !!process.env.GROQ_API_KEY ? 'SET' : 'MISSING',
    DATABASE_URL: !!process.env.DATABASE_URL ? 'SET' : 'MISSING',
    DATABASE_HOST: dbHost,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL || 'not set',
  };

  // 2. Try DB connection + raw data check
  if (process.env.DATABASE_URL) {
    try {
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(process.env.DATABASE_URL);
      const result = await sql`SELECT 1 as ok`;
      checks.db = { status: 'connected', result: result[0] };

      // Write-read test: write a timestamp to a test table and read it back
      try {
        await sql`CREATE TABLE IF NOT EXISTS health_ping (id INTEGER PRIMARY KEY DEFAULT 1, ts TEXT, source TEXT)`;
        const source = process.env.VERCEL ? 'vercel' : 'local';
        const ts = new Date().toISOString();
        await sql`INSERT INTO health_ping (id, ts, source) VALUES (1, ${ts}, ${source}) ON CONFLICT (id) DO UPDATE SET ts = ${ts}, source = ${source}`;
        const pingResult = await sql`SELECT ts, source FROM health_ping WHERE id = 1`;
        checks.writeReadTest = { wrote: { ts, source }, read: pingResult[0] };
      } catch (e: unknown) {
        checks.writeReadTest = { error: (e as Error).message };
      }

      // Check metadata to see when/where data was last written
      try {
        const metaResult = await sql`SELECT last_modified, last_source FROM app_data WHERE id = 1`;
        checks.appDataMeta = metaResult.length > 0 ? metaResult[0] : 'no row';
      } catch (e: unknown) {
        checks.appDataMeta = { error: (e as Error).message };
      }

      // Check raw data type from Neon
      const rawResult = await sql`SELECT data FROM app_data WHERE id = 1`;
      if (rawResult.length > 0) {
        const rawData = rawResult[0].data;
        checks.rawDataType = typeof rawData;
        checks.rawDataIsArray = Array.isArray(rawData);
        if (typeof rawData === 'object' && rawData !== null) {
          const obj = rawData as Record<string, unknown>;
          checks.rawDataKeys = Object.keys(obj);
          checks.rawUsersType = typeof obj.users;
          checks.rawUsersIsArray = Array.isArray(obj.users);
          checks.rawUsersLength = Array.isArray(obj.users) ? obj.users.length : 'n/a';
          if (Array.isArray(obj.users) && obj.users.length > 0) {
            checks.rawUserIds = (obj.users as { id: string }[]).map((u) => u.id);
          }
        }
      } else {
        checks.rawDataType = 'no row found';
      }
    } catch (err: unknown) {
      checks.db = {
        status: 'error',
        message: (err as Error).message,
        name: (err as Error).name,
      };
    }
  } else {
    checks.db = { status: 'skipped', reason: 'no DATABASE_URL' };
  }

  // 3. Try initDb
  try {
    const { initDb, readDb } = await import('@/server/db');
    await initDb();
    const db = readDb();
    checks.initDb = {
      status: 'ok',
      users: db.users.length,
      profiles: db.profiles.length,
      categories: db.categories.length,
      xpLogs: db.xpLogs.length,
      calendarEntries: db.calendarEntries.length,
      habits: db.habits.length,
      userIds: db.users.map((u) => u.id),
      profileUserIds: db.profiles.map((p) => p.userId),
    };
    // DO NOT call flushDb() here — health endpoint is read-only
  } catch (err: unknown) {
    checks.initDb = {
      status: 'error',
      message: (err as Error).message,
      stack: (err as Error).stack?.split('\n').slice(0, 5),
    };
  }

  return NextResponse.json(checks, { status: 200 });
}
