// app/api/admin/applications/[id]/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireRole } from '@/lib/permissions';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole('admin');
  if ('error' in guard) return guard.error;

  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const body = await req.json();
  const action = body.action;
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected';

  const result = await sql`
    UPDATE users
    SET status = ${newStatus}
    WHERE id = ${userId} AND role != 'admin'
    RETURNING id
  `;
  if (result.length === 0) {
    return NextResponse.json({ error: 'User not found or is admin' }, { status: 404 });
  }

  return NextResponse.json({ message: `Application ${newStatus}` });
}