import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Lightweight health check. Only verifies:
 * 1. Environment variables are set
 * 2. Database connectivity (SELECT 1)
 * Does NOT load the full app_data blob.
 */
export async function GET() {
  const checks: Record<string, unknown> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };

  // 1. Check env vars
  checks.env = {
    JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'MISSING',
    GROQ_API_KEY: process.env.GROQ_API_KEY ? 'SET' : 'MISSING',
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
    NODE_ENV: process.env.NODE_ENV,
  };

  // 2. Lightweight DB connectivity check (no full data load)
  if (process.env.DATABASE_URL) {
    try {
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(process.env.DATABASE_URL, { fetchOptions: { cache: 'no-store' } });
      const result = await sql`SELECT 1 as ok`;
      checks.db = { status: 'connected', result: result[0] };
    } catch (err: unknown) {
      checks.db = {
        status: 'error',
        message: (err as Error).message,
      };
      checks.status = 'degraded';
    }
  } else {
    checks.db = { status: 'skipped', reason: 'no DATABASE_URL' };
  }

  return NextResponse.json(checks, { status: 200 });
}
