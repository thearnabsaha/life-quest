import { NextRequest, NextResponse } from 'next/server';
import { withDb } from '@/server/api-utils';
import * as authService from '@/server/services/auth.service';

export const POST = withDb(async (req: NextRequest) => {
  const body = await req.json();
  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }
  const result = await authService.login(email, password);
  return NextResponse.json(result);
});
