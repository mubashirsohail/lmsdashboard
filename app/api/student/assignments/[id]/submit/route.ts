// app/api/student/assignments/[id]/submit/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireRole } from '@/lib/permissions';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole('student');
  if ('error' in guard) return guard.error;

  const { id } = await params;
  const assignmentId = Number(id);
  const studentId = Number(guard.session.user.id);

  const { content } = await req.json();
  if (!content || !content.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  // Must be enrolled in the assignment's course
  const enrolled = await sql`
    SELECT a.id FROM assignments a
    JOIN course_enrollments e ON e.course_id = a.course_id
    WHERE a.id = ${assignmentId} AND e.student_id = ${studentId}
  `;
  if (enrolled.length === 0) {
    return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 });
  }

  try {
    await sql`
      INSERT INTO assignment_submissions (assignment_id, student_id, content)
      VALUES (${assignmentId}, ${studentId}, ${content})
    `;
    return NextResponse.json({ message: 'Submitted' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'You already submitted this assignment' }, { status: 409 });
  }
}