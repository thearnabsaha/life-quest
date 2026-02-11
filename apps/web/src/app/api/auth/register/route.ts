import { NextRequest, NextResponse } from 'next/server';
import { withDb } from '@/server/api-utils';
import * as authService from '@/server/services/auth.service';

export const dynamic = 'force-dynamic';

export const POST = withDb(async (req: NextRequest) => {
  const body = await req.json();
  const { email, password, displayName } = body;
  if (!email || !password || !displayName) {
    return NextResponse.json({ message: 'Email, password, and displayName are required' }, { status: 400 });
  }
  const result = await authService.register(email, password, displayName);
  return NextResponse.json(result, { status: 201 });
});
