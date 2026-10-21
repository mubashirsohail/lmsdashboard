// app/api/instructor/assignments/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireRole } from '@/lib/permissions';

export async function GET() {
  const guard = await requireRole('instructor');
  if ('error' in guard) return guard.error;

  const rows = await sql`
    SELECT a.id, a.course_id, a.title, a.description, a.total_marks, a.due_date,
           c.code AS course_code, c.title AS course_title
    FROM assignments a
    JOIN courses c ON c.id = a.course_id
    WHERE c.instructor_id = ${Number(guard.session.user.id)}
    ORDER BY a.created_at DESC
  `;
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const guard = await requireRole('instructor');
  if ('error' in guard) return guard.error;

  const { courseId, title, description, totalMarks, dueDate } = await req.json();
  if (!courseId || !title) {
    return NextResponse.json({ error: 'Course and title are required' }, { status: 400 });
  }

  // Ownership check
  const owns = await sql`
    SELECT id FROM courses WHERE id = ${Number(courseId)}
    AND instructor_id = ${Number(guard.session.user.id)}
  `;
  if (owns.length === 0) {
    return NextResponse.json({ error: 'Course not assigned to you' }, { status: 403 });
  }

  const [row] = await sql`
    INSERT INTO assignments (course_id, title, description, total_marks, due_date)
    VALUES (${Number(courseId)}, ${title}, ${description ?? null}, ${totalMarks ?? 100}, ${dueDate ?? null})
    RETURNING id
  `;
  return NextResponse.json({ id: row.id }, { status: 201 });
}