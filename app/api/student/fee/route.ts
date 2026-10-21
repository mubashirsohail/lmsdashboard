// app/api/student/fee/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireRole } from '@/lib/permissions';

export async function GET() {
  const guard = await requireRole('student');
  if ('error' in guard) return guard.error;

  const [row] = await sql`
    SELECT total_amount, paid_amount, due_date
    FROM student_fees
    WHERE student_id = ${Number(guard.session.user.id)}
  `;
  return NextResponse.json(row ?? { total_amount: 0, paid_amount: 0, due_date: null });
}