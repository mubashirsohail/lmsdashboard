// app/fee/page.tsx
import { auth } from '@/auth';
import { sql } from '@/lib/db';
import Link from 'next/link';

//export const dynamic = 'force-dynamic';

export const instant = false; 
export default async function FeePage() {
  const session = await auth();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Fee Information</h1>

      {!session?.user && (
        <div className="rounded-lg border p-6 dark:border-gray-700">
          <p className="mb-3">Please log in to view your fee details.</p>
          <Link href="/login" className="rounded bg-blue-600 px-4 py-2 text-white">Login</Link>
        </div>
      )}

      {session?.user?.role === 'student' && (
        <StudentFee userId={Number(session.user.id)} />
      )}

      {session?.user?.role === 'instructor' && (
        <p className="text-gray-500">Fee information is available only to students.</p>
      )}

      {session?.user?.role === 'admin' && (
        <div className="rounded-lg border p-6 dark:border-gray-700">
          <p className="mb-3">You manage student fees from the admin dashboard.</p>
          <Link href="/admin" className="rounded bg-blue-600 px-4 py-2 text-white">Go to Admin</Link>
        </div>
      )}
    </main>
  );
}

async function StudentFee({ userId }: { userId: number }) {
  const [row] = await sql`
    SELECT total_amount, paid_amount, due_date
    FROM student_fees WHERE student_id = ${userId}
  `;
  const total = row?.total_amount ?? 0;
  const paid = row?.paid_amount ?? 0;
  const remaining = total - paid;

  return (
    <div className="rounded-lg border p-6 dark:border-gray-700">
      <h2 className="mb-3 text-lg font-semibold">Your Fee Summary</h2>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between"><dt>Total</dt><dd className="font-semibold">PKR {total}</dd></div>
        <div className="flex justify-between"><dt>Paid</dt><dd className="font-semibold text-green-600">PKR {paid}</dd></div>
        <div className="flex justify-between"><dt>Remaining</dt>
          <dd className={`font-semibold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>PKR {remaining}</dd>
        </div>
        {row?.due_date && (
          <div className="flex justify-between"><dt>Due Date</dt><dd>{row.due_date}</dd></div>
        )}
      </dl>
      <p className="mt-4 text-xs text-gray-500">
        Online payment is not available. Contact the accounts office to pay.
      </p>
    </div>
  );
}