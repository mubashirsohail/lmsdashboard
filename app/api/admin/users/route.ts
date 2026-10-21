// app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireRole } from '@/lib/permissions';

export async function GET() {
  const guard = await requireRole('admin');
  if ('error' in guard) return guard.error;

  const rows = await sql`
    SELECT u.id, u.email, u.full_name, u.role, u.status,
           f.total_amount, f.paid_amount, f.due_date
    FROM users u
    LEFT JOIN student_fees f ON f.student_id = u.id
    WHERE u.role != 'admin'
    ORDER BY u.role, u.full_name
  `;
  return NextResponse.json(rows);
}