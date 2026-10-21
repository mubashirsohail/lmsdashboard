// app/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Footer from '@/components/Footer';

const HERO_PHRASES = [
  'Learn without limits.',
  'Study from anywhere.',
  'Grow with expert instructors.',
];

function useTyping(phrases: string[]) {
  const [text, setText] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx];
    const speed = deleting ? 40 : 80;
    const timer = setTimeout(() => {
      if (!deleting) {
        const next = current.slice(0, text.length + 1);
        setText(next);
        if (next === current) setTimeout(() => setDeleting(true), 1200);
      } else {
        const next = current.slice(0, text.length - 1);
        setText(next);
        if (next === '') {
          setDeleting(false);
          setPhraseIdx((i) => (i + 1) % phrases.length);
        }
      }
    }, speed);
    return () => clearTimeout(timer);
  }, [text, deleting, phraseIdx, phrases]);

  return text;
}

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setInView(true),
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      setN(Math.floor(target * p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);
  return <span ref={ref}>{n}{suffix}</span>;
}

export default function HomePage() {
  const typed = useTyping(HERO_PHRASES);

  return (
    <>
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
          <div className="mx-auto max-w-6xl px-4 py-24 text-center md:py-32">
            <span className="mb-4 inline-block rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-900 dark:bg-gray-900 dark:text-blue-300">
              Virtual University · Inspired LMS
            </span>
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-6xl">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {typed}
              </span>
              <span className="ml-1 inline-block w-1 animate-pulse bg-blue-600 align-middle" style={{ height: '1em' }} />
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Enroll in courses, submit assignments, take auto-graded quizzes, and track your fees — all in one place.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 sm:w-auto"
              >
                Register as Student
              </Link>
              <Link
                href="/register?role=instructor"
                className="w-full rounded-lg border border-blue-600 px-6 py-3 font-semibold text-blue-600 transition hover:-translate-y-0.5 hover:bg-blue-50 dark:hover:bg-gray-800 sm:w-auto"
              >
                Apply for Instructor
              </Link>
            </div>

            {/* Stats */}
            <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 md:grid-cols-4">
              {[
                { label: 'Courses', target: 25, suffix: '+' },
                { label: 'Students', target: 500, suffix: '+' },
                { label: 'Instructors', target: 40, suffix: '+' },
                { label: 'Uptime', target: 99, suffix: '%' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border bg-white/70 p-4 backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
                  <div className="text-2xl font-bold text-blue-600 md:text-3xl">
                    <Counter target={s.target} suffix={s.suffix} />
                  </div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Everything you need to succeed</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Built for students, instructors, and administrators.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: '📚', title: 'Courses', desc: 'Browse and enroll in courses taught by expert instructors.' },
              { icon: '📝', title: 'Assignments', desc: 'Submit work online and receive marks and feedback.' },
              { icon: '🧠', title: 'Quizzes', desc: 'Auto-graded MCQs with instant results and no retakes.' },
              { icon: '💳', title: 'Fees', desc: 'View your fee summary in PKR at any time.' },
              { icon: '🎓', title: 'Dashboard', desc: 'Role-based dashboards for students, instructors, and admins.' },
              { icon: '🌙', title: 'Dark Mode', desc: 'Comfortable reading in any lighting condition.' },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border bg-white p-6 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-800"
              >
                <div className="mb-4 text-3xl transition group-hover:scale-110">{f.icon}</div>
                <h3 className="mb-1 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4">
          <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 text-center text-white shadow-2xl">
            <h2 className="text-2xl font-bold md:text-3xl">Ready to start learning?</h2>
            <p className="mt-2 opacity-90">Apply today. Approval usually takes under 24 hours.</p>
            <Link
              href="/register"
              className="mt-6 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Apply Now
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}