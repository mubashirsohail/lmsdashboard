// app/api/admin/users/[id]/enroll/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireRole } from '@/lib/permissions';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole('admin');
  if ('error' in guard) return guard.error;

  const { id } = await params;
  const studentId = Number(id);
  const { courseId } = await req.json();

  try {
    await sql`
      INSERT INTO course_enrollments (student_id, course_id)
      VALUES (${studentId}, ${Number(courseId)})
    `;
    return NextResponse.json({ message: 'Enrolled' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Already enrolled' }, { status: 409 });
  }
}