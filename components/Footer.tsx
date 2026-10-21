// components/Footer.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="mt-20 border-t bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <h3 className="mb-3 text-lg font-bold">VU LMS</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            A simple learning management system for students and instructors.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase text-gray-500">Explore</h4>
          <ul className="space-y-1 text-sm">
            <li><Link href="/" className="hover:underline">Home</Link></li>
            <li><Link href="/courses" className="hover:underline">Courses</Link></li>
            <li><Link href="/fee" className="hover:underline">Fee</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase text-gray-500">Account</h4>
          <ul className="space-y-1 text-sm">
            <li><Link href="/login" className="hover:underline">Login</Link></li>
            <li><Link href="/register" className="hover:underline">Register</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase text-gray-500">Contact</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            info@vu-lms.local<br />+92 000 0000000
          </p>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-gray-500 dark:border-gray-800">
        © {year ?? '2026'} VU LMS. All rights reserved.
      </div>
    </footer>
  );
}