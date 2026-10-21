// app/api/instructor/quizzes/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireRole } from '@/lib/permissions';

type Question = {
  questionText: string;
  optionA: string; optionB: string; optionC: string; optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  marks: number;
};

export async function GET() {
  const guard = await requireRole('instructor');
  if ('error' in guard) return guard.error;

  const rows = await sql`
    SELECT q.id, q.title, q.total_marks, q.course_id,
           c.code AS course_code,
           COUNT(qq.id)::int AS question_count
    FROM quizzes q
    JOIN courses c ON c.id = q.course_id
    LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id
    WHERE c.instructor_id = ${Number(guard.session.user.id)}
    GROUP BY q.id, c.code
    ORDER BY q.created_at DESC
  `;
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const guard = await requireRole('instructor');
  if ('error' in guard) return guard.error;

  const { courseId, title, questions } = await req.json() as {
    courseId: number; title: string; questions: Question[];
  };

  if (!courseId || !title || !Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ error: 'Course, title and at least one question are required' }, { status: 400 });
  }

  const owns = await sql`
    SELECT id FROM courses WHERE id = ${Number(courseId)}
    AND instructor_id = ${Number(guard.session.user.id)}
  `;
  if (owns.length === 0) {
    return NextResponse.json({ error: 'Course not assigned to you' }, { status: 403 });
  }

  const totalMarks = questions.reduce((s, q) => s + (q.marks || 0), 0);

  const [quiz] = await sql`
    INSERT INTO quizzes (course_id, title, total_marks)
    VALUES (${Number(courseId)}, ${title}, ${totalMarks})
    RETURNING id
  `;

  for (const q of questions) {
    await sql`
      INSERT INTO quiz_questions
        (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks)
      VALUES (
        ${quiz.id}, ${q.questionText},
        ${q.optionA}, ${q.optionB}, ${q.optionC}, ${q.optionD},
        ${q.correctOption}, ${q.marks}
      )
    `;
  }

  return NextResponse.json({ id: quiz.id }, { status: 201 });
}