// app/api/admin/courses/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireRole } from '@/lib/permissions';

export async function GET() {
  const guard = await requireRole('admin');
  if ('error' in guard) return guard.error;

  const rows = await sql`
    SELECT c.id, c.code, c.title, c.description, c.credit_hours, c.instructor_id,
           u.full_name AS instructor_name
    FROM courses c
    LEFT JOIN users u ON u.id = c.instructor_id
    ORDER BY c.code ASC
  `;
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const guard = await requireRole('admin');
  if ('error' in guard) return guard.error;

  const { code, title, description, creditHours, instructorId } = await req.json();
  if (!code || !title) {
    return NextResponse.json({ error: 'Code and title are required' }, { status: 400 });
  }

  try {
    const [row] = await sql`
      INSERT INTO courses (code, title, description, credit_hours, instructor_id)
      VALUES (${code}, ${title}, ${description ?? null}, ${creditHours ?? 3}, ${instructorId ?? null})
      RETURNING id
    `;
    return NextResponse.json({ id: row.id }, { status: 201 });
  } catch (err) {
    console.error('Create course error:', err);
    return NextResponse.json({ error: 'Could not create course (code may exist)' }, { status: 400 });
  }
}