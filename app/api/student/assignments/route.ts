// app/api/student/assignments/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireRole } from '@/lib/permissions';

export async function GET() {
  const guard = await requireRole('student');
  if ('error' in guard) return guard.error;

  const studentId = Number(guard.session.user.id);

  const rows = await sql`
    SELECT a.id, a.title, a.description, a.total_marks, a.due_date,
           c.code AS course_code,
           s.id AS submission_id, s.content AS submission_content,
           s.submitted_at, s.marks_obtained, s.feedback
    FROM assignments a
    JOIN courses c ON c.id = a.course_id
    JOIN course_enrollments e ON e.course_id = c.id AND e.student_id = ${studentId}
    LEFT JOIN assignment_submissions s
      ON s.assignment_id = a.id AND s.student_id = ${studentId}
    ORDER BY a.created_at DESC
  `;
  return NextResponse.json(rows);
}