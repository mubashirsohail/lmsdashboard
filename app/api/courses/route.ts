// app/api/courses/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  const rows = await sql`
    SELECT c.id, c.code, c.title, c.description, c.credit_hours,
           u.full_name AS instructor_name
    FROM courses c
    LEFT JOIN users u ON u.id = c.instructor_id
    ORDER BY c.code ASC
  `;
  return NextResponse.json(rows);
}