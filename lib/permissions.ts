// lib/permissions.ts
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { session };
}

export async function requireRole(role: 'admin' | 'instructor' | 'student') {
  const result = await requireAuth();
  if ('error' in result) return result;
  if (result.session.user.role !== role) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return result;
}