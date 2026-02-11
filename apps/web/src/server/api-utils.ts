import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { initDb, flushDb, requestStorage } from './db';
import type { Database } from './db';

// ===== Error class =====
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// ===== Auth helper =====
export async function getUserId(req: NextRequest): Promise<string> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'Missing or invalid authorization header');
  }
  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
  try {
    const decoded = jwt.verify(token, secret) as { userId: string };
    return decoded.userId;
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }
}

// ===== Error handler =====
export function handleError(err: unknown): NextResponse {
  if (err instanceof AppError) {
    return NextResponse.json(
      { message: err.message, code: err.code },
      { status: err.statusCode }
    );
  }
  console.error('[API Error]', err);
  // Always return the error message for debugging (serverless has no persistent logs)
  const message = (err as Error).message || 'Internal server error';
  return NextResponse.json({ message }, { status: 500 });
}

// ===== Route handler wrapper with DB init/flush =====
type RouteContext = { params: Promise<Record<string, string>> };

type Handler = (
  req: NextRequest,
  ctx: RouteContext
) => Promise<NextResponse>;

/**
 * Wraps a Next.js API route handler to:
 * 1. Load the DB at request start (in per-request isolation context)
 * 2. Handle errors uniformly
 * 3. Flush DB changes at request end
 *
 * Uses AsyncLocalStorage so concurrent requests don't share DB state.
 */
export function withDb(handler: Handler): Handler {
  return async (req: NextRequest, ctx: RouteContext) => {
    // Each request gets its own isolated DB context
    return requestStorage.run(
      { db: null as unknown as Database, dirty: false },
      async () => {
        try {
          await initDb();
          const response = await handler(req, ctx);
          await flushDb();
          return response;
        } catch (err) {
          // Still try to flush in case of partial writes
          try {
            await flushDb();
          } catch {
            // ignore flush errors during error handling
          }
          return handleError(err);
        }
      }
    );
  };
}
