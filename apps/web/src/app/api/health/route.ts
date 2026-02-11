import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, unknown> = {};

  // 1. Check env vars
  checks.env = {
    JWT_SECRET: !!process.env.JWT_SECRET ? 'SET' : 'MISSING',
    GROQ_API_KEY: !!process.env.GROQ_API_KEY ? 'SET' : 'MISSING',
    DATABASE_URL: !!process.env.DATABASE_URL ? 'SET' : 'MISSING',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL || 'not set',
  };

  // 2. Try DB connection + raw data check
  if (process.env.DATABASE_URL) {
    try {
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(process.env.DATABASE_URL, { fetchOptions: { cache: 'no-store' } });
      const result = await sql`SELECT 1 as ok`;
      checks.db = { status: 'connected', result: result[0] };

      // Check raw data from Neon
      const rawResult = await sql`SELECT data FROM app_data WHERE id = 1`;
      if (rawResult.length > 0) {
        const rawData = rawResult[0].data;
        checks.rawDataType = typeof rawData;
        if (typeof rawData === 'object' && rawData !== null) {
          const obj = rawData as Record<string, unknown>;
          checks.rawUsersLength = Array.isArray(obj.users) ? obj.users.length : 'n/a';
          checks.rawXPLogsLength = Array.isArray(obj.xpLogs) ? obj.xpLogs.length : 'n/a';
          checks.rawCalendarLength = Array.isArray(obj.calendarEntries) ? obj.calendarEntries.length : 'n/a';
        }
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

  // 3. Try initDb (read-only — no flushDb call)
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
    };
  } catch (err: unknown) {
    checks.initDb = {
      status: 'error',
      message: (err as Error).message,
    };
  }

  return NextResponse.json(checks, { status: 200 });
}
