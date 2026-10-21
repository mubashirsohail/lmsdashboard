// app/login/page.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    const res = await signIn('credentials', {
      email: fd.get('email'),
      password: fd.get('password'),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError('Invalid credentials or account not approved.');
      return;
    }
    // Fetch session to know role
    const session = await fetch('/api/auth/session').then((r) => r.json());
    const role = session?.user?.role;
    router.push(role === 'admin' ? '/admin' : role === 'instructor' ? '/instructor' : '/student');
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="email" type="email" placeholder="Email" required className="w-full rounded border p-2 dark:bg-gray-800" />
        <input name="password" type="password" placeholder="Password" required className="w-full rounded border p-2 dark:bg-gray-800" />
        <button disabled={loading} className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {error && <p className="mt-4 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900 dark:text-red-200">{error}</p>}
    </main>
  );
}