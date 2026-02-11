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

  // 2. Try DB connection
  if (process.env.DATABASE_URL) {
    try {
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(process.env.DATABASE_URL);
      const result = await sql`SELECT 1 as ok`;
      checks.db = { status: 'connected', result: result[0] };
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
    const { initDb, readDb, flushDb } = await import('@/server/db');
    await initDb();
    const db = readDb();
    checks.initDb = {
      status: 'ok',
      users: db.users.length,
      profiles: db.profiles.length,
      categories: db.categories.length,
    };
    await flushDb();
  } catch (err: unknown) {
    checks.initDb = {
      status: 'error',
      message: (err as Error).message,
      stack: (err as Error).stack?.split('\n').slice(0, 5),
    };
  }

  return NextResponse.json(checks, { status: 200 });
}
