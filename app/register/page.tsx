// app/register/page.tsx
'use client';

import { useState } from 'react';

export default function RegisterPage() {
  const [role, setRole] = useState<'student' | 'instructor'>('student');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setError('');
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    payload.role = role;

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMsg(data.message);
      (e.target as HTMLFormElement).reset();
    } else {
      setError(data.error);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Apply for Admission</h1>
      <div className="mb-4 flex gap-4">
        <label className="flex items-center gap-2">
          <input type="radio" checked={role === 'student'} onChange={() => setRole('student')} />
          Student
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" checked={role === 'instructor'} onChange={() => setRole('instructor')} />
          Instructor
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="fullName" placeholder="Full Name" required className="w-full rounded border p-2 dark:bg-gray-800" />
        <input name="email" type="email" placeholder="Email" required className="w-full rounded border p-2 dark:bg-gray-800" />
        <input name="password" type="password" placeholder="Password (min 6)" required minLength={6} className="w-full rounded border p-2 dark:bg-gray-800" />

        {role === 'student' ? (
          <>
            <input name="program" placeholder="Program (e.g., BS Computer Science)" className="w-full rounded border p-2 dark:bg-gray-800" />
            <input name="semester" type="number" placeholder="Semester" className="w-full rounded border p-2 dark:bg-gray-800" />
          </>
        ) : (
          <>
            <input name="department" placeholder="Department" className="w-full rounded border p-2 dark:bg-gray-800" />
            <input name="designation" placeholder="Designation" className="w-full rounded border p-2 dark:bg-gray-800" />
          </>
        )}

        <button disabled={loading} className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>

      {msg && <p className="mt-4 rounded bg-green-100 p-2 text-green-700 dark:bg-green-900 dark:text-green-200">{msg}</p>}
      {error && <p className="mt-4 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900 dark:text-red-200">{error}</p>}
    </main>
  );
}