// app/api/student/courses/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireRole } from '@/lib/permissions';

export async function GET() {
  const guard = await requireRole('student');
  if ('error' in guard) return guard.error;

  const rows = await sql`
    SELECT c.id, c.code, c.title, c.credit_hours, u.full_name AS instructor_name
    FROM course_enrollments e
    JOIN courses c ON c.id = e.course_id
    LEFT JOIN users u ON u.id = c.instructor_id
    WHERE e.student_id = ${Number(guard.session.user.id)}
    ORDER BY c.code ASC
  `;
  return NextResponse.json(rows);
}