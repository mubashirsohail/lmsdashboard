// app/api/instructor/assignments/[id]/submissions/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireRole } from '@/lib/permissions';

async function assertOwnsAssignment(assignmentId: number, instructorId: number) {
  const rows = await sql`
    SELECT a.id FROM assignments a
    JOIN courses c ON c.id = a.course_id
    WHERE a.id = ${assignmentId} AND c.instructor_id = ${instructorId}
  `;
  return rows.length > 0;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole('instructor');
  if ('error' in guard) return guard.error;

  const { id } = await params;
  const assignmentId = Number(id);
  if (!(await assertOwnsAssignment(assignmentId, Number(guard.session.user.id)))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const rows = await sql`
    SELECT s.id, s.content, s.submitted_at, s.marks_obtained, s.feedback,
           u.full_name AS student_name, u.email AS student_email
    FROM assignment_submissions s
    JOIN users u ON u.id = s.student_id
    WHERE s.assignment_id = ${assignmentId}
    ORDER BY s.submitted_at ASC
  `;
  return NextResponse.json(rows);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole('instructor');
  if ('error' in guard) return guard.error;

  const { id } = await params;
  const assignmentId = Number(id);
  if (!(await assertOwnsAssignment(assignmentId, Number(guard.session.user.id)))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { submissionId, marks, feedback } = await req.json();

  await sql`
    UPDATE assignment_submissions
    SET marks_obtained = ${marks ?? null}, feedback = ${feedback ?? null}
    WHERE id = ${Number(submissionId)} AND assignment_id = ${assignmentId}
  `;
  return NextResponse.json({ message: 'Graded' });
}