// app/api/admin/users/[id]/status/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireRole } from '@/lib/permissions';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole('admin');
  if ('error' in guard) return guard.error;

  const { id } = await params;
  const { status } = await req.json();
  if (!['approved', 'deactivated'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  await sql`
    UPDATE users SET status = ${status}
    WHERE id = ${Number(id)} AND role != 'admin'
  `;
  return NextResponse.json({ message: 'Status updated' });
}