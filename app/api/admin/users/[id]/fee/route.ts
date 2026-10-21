// app/api/admin/users/[id]/fee/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireRole } from '@/lib/permissions';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole('admin');
  if ('error' in guard) return guard.error;

  const { id } = await params;
  const studentId = Number(id);
  const { totalAmount, paidAmount, dueDate } = await req.json();

  await sql`
    INSERT INTO student_fees (student_id, total_amount, paid_amount, due_date, updated_at)
    VALUES (${studentId}, ${totalAmount ?? 0}, ${paidAmount ?? 0}, ${dueDate ?? null}, NOW())
    ON CONFLICT (student_id) DO UPDATE
      SET total_amount = EXCLUDED.total_amount,
          paid_amount = EXCLUDED.paid_amount,
          due_date = EXCLUDED.due_date,
          updated_at = NOW()
  `;
  return NextResponse.json({ message: 'Fee updated' });
}