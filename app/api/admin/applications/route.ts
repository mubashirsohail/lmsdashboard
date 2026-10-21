// app/api/admin/applications/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireRole } from '@/lib/permissions';

export async function GET() {
  const guard = await requireRole('admin');
  if ('error' in guard) return guard.error;

  const rows = await sql`
    SELECT u.id, u.email, u.full_name, u.role, u.created_at,
           sp.program, sp.semester,
           ip.department, ip.designation
    FROM users u
    LEFT JOIN student_profiles sp ON sp.user_id = u.id
    LEFT JOIN instructor_profiles ip ON ip.user_id = u.id
    WHERE u.status = 'pending'
    ORDER BY u.created_at ASC
  `;
  return NextResponse.json(rows);
}