// app/api/student/quizzes/[id]/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireRole } from '@/lib/permissions';

async function studentCanAccess(quizId: number, studentId: number) {
  const rows = await sql`
    SELECT q.id FROM quizzes q
    JOIN course_enrollments e ON e.course_id = q.course_id
    WHERE q.id = ${quizId} AND e.student_id = ${studentId}
  `;
  return rows.length > 0;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole('student');
  if ('error' in guard) return guard.error;

  const { id } = await params;
  const quizId = Number(id);
  const studentId = Number(guard.session.user.id);

  if (!(await studentCanAccess(quizId, studentId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [quiz] = await sql`
    SELECT id, title, total_marks FROM quizzes WHERE id = ${quizId}
  `;
  const questions = await sql`
    SELECT id, question_text, option_a, option_b, option_c, option_d, marks
    FROM quiz_questions
    WHERE quiz_id = ${quizId}
    ORDER BY id ASC
  `;
  const [attempt] = await sql`
    SELECT marks_obtained FROM quiz_attempts
    WHERE quiz_id = ${quizId} AND student_id = ${studentId}
  `;

  return NextResponse.json({ quiz, questions, attempt: attempt ?? null });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole('student');
  if ('error' in guard) return guard.error;

  const { id } = await params;
  const quizId = Number(id);
  const studentId = Number(guard.session.user.id);

  if (!(await studentCanAccess(quizId, studentId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { answers } = await req.json() as { answers: Record<string, string> };

  const questions = await sql`
    SELECT id, correct_option, marks FROM quiz_questions WHERE quiz_id = ${quizId}
  `;

  let earned = 0;
  for (const q of questions) {
    if (answers[String(q.id)] === q.correct_option) earned += q.marks;
  }

  try {
    await sql`
      INSERT INTO quiz_attempts (quiz_id, student_id, answers, marks_obtained)
      VALUES (${quizId}, ${studentId}, ${JSON.stringify(answers)}::jsonb, ${earned})
    `;
  } catch {
    return NextResponse.json({ error: 'You already attempted this quiz' }, { status: 409 });
  }

  const [quizRow] = await sql`SELECT total_marks FROM quizzes WHERE id = ${quizId}`;
  return NextResponse.json({
    marksObtained: earned,
    totalMarks: quizRow.total_marks,
  });
}