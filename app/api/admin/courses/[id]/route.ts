// app/api/admin/courses/[id]/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireRole } from '@/lib/permissions';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole('admin');
  if ('error' in guard) return guard.error;

  const { id } = await params;
  const courseId = Number(id);
  const { title, description, creditHours, instructorId } = await req.json();

  await sql`
    UPDATE courses
    SET title = COALESCE(${title ?? null}, title),
        description = COALESCE(${description ?? null}, description),
        credit_hours = COALESCE(${creditHours ?? null}, credit_hours),
        instructor_id = ${instructorId ?? null}
    WHERE id = ${courseId}
  `;
  return NextResponse.json({ message: 'Course updated' });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole('admin');
  if ('error' in guard) return guard.error;

  const { id } = await params;
  await sql`DELETE FROM courses WHERE id = ${Number(id)}`;
  return NextResponse.json({ message: 'Course deleted' });
}