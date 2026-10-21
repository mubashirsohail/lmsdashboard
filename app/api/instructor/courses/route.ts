// app/api/instructor/courses/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireRole } from '@/lib/permissions';

export async function GET() {
  const guard = await requireRole('instructor');
  if ('error' in guard) return guard.error;

  const rows = await sql`
    SELECT c.id, c.code, c.title, c.credit_hours
    FROM courses c
    WHERE c.instructor_id = ${Number(guard.session.user.id)}
    ORDER BY c.code ASC
  `;
  return NextResponse.json(rows);
}