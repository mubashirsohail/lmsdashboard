// app/api/student/quizzes/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireRole } from '@/lib/permissions';

export async function GET() {
  const guard = await requireRole('student');
  if ('error' in guard) return guard.error;

  const studentId = Number(guard.session.user.id);

  const rows = await sql`
    SELECT q.id, q.title, q.total_marks, c.code AS course_code,
           COUNT(qq.id)::int AS question_count,
           at.marks_obtained, at.attempted_at
    FROM quizzes q
    JOIN courses c ON c.id = q.course_id
    JOIN course_enrollments e ON e.course_id = c.id AND e.student_id = ${studentId}
    LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id
    LEFT JOIN quiz_attempts at ON at.quiz_id = q.id AND at.student_id = ${studentId}
    GROUP BY q.id, c.code, at.marks_obtained, at.attempted_at
    ORDER BY q.created_at DESC
  `;
  return NextResponse.json(rows);
}