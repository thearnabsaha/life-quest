import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { initDb, flushDb } from './db';

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
  console.error(err);
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : (err as Error).message || 'Internal server error';
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
 * 1. Load the DB at request start
 * 2. Handle errors uniformly
 * 3. Flush DB changes at request end
 */
export function withDb(handler: Handler): Handler {
  return async (req: NextRequest, ctx: RouteContext) => {
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
  };
}
