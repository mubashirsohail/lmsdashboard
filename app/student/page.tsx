// app/student/page.tsx
'use client';

import { useEffect, useState } from 'react';

type Course = { id: number; code: string; title: string; credit_hours: number; instructor_name: string | null };
type Assignment = {
  id: number; title: string; description: string; total_marks: number; due_date: string | null;
  course_code: string; submission_id: number | null; submission_content: string | null;
  submitted_at: string | null; marks_obtained: number | null; feedback: string | null;
};
type Quiz = {
  id: number; title: string; total_marks: number; course_code: string;
  question_count: number; marks_obtained: number | null; attempted_at: string | null;
};
type Fee = { total_amount: number; paid_amount: number; due_date: string | null };

export default function StudentPage() {
  const [tab, setTab] = useState<'courses' | 'assignments' | 'quizzes' | 'fee'>('courses');
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Student Dashboard</h1>
      <div className="mb-6 flex gap-2 border-b dark:border-gray-700">
        {(['courses', 'assignments', 'quizzes', 'fee'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize ${tab === t ? 'border-b-2 border-blue-600 font-semibold' : ''}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === 'courses' && <CoursesTab />}
      {tab === 'assignments' && <AssignmentsTab />}
      {tab === 'quizzes' && <QuizzesTab />}
      {tab === 'fee' && <FeeTab />}
    </main>
  );
}

function CoursesTab() {
  const [courses, setCourses] = useState<Course[]>([]);
  useEffect(() => {
    fetch('/api/student/courses').then((r) => r.json()).then(setCourses);
  }, []);
  if (courses.length === 0) return <p className="text-gray-500">No courses yet. Contact the admin.</p>;
  return (
    <div className="space-y-2">
      {courses.map((c) => (
        <div key={c.id} className="rounded border p-3 dark:border-gray-700">
          <span className="font-mono">{c.code}</span> — <span className="font-semibold">{c.title}</span>
          <span className="ml-2 text-sm text-gray-500">({c.credit_hours} CH · {c.instructor_name ?? 'TBA'})</span>
        </div>
      ))}
    </div>
  );
}

function AssignmentsTab() {
  const [list, setList] = useState<Assignment[]>([]);
  const [open, setOpen] = useState<number | null>(null);

  async function load() {
    setList(await fetch('/api/student/assignments').then((r) => r.json()));
  }
  useEffect(() => { load(); }, []);

  async function submit(assignmentId: number, form: FormData) {
    const res = await fetch(`/api/student/assignments/${assignmentId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: form.get('content') }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error);
      return;
    }
    setOpen(null);
    load();
  }

  if (list.length === 0) return <p className="text-gray-500">No assignments yet.</p>;
  return (
    <div className="space-y-2">
      {list.map((a) => (
        <div key={a.id} className="rounded border p-3 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs text-gray-500">{a.course_code}</span>
            <span className="font-semibold">{a.title}</span>
            <span className="text-sm text-gray-500">{a.total_marks} marks</span>
            {a.due_date && <span className="text-xs text-gray-500">Due: {new Date(a.due_date).toLocaleString()}</span>}
            {a.submission_id ? (
              <span className="ml-auto text-sm text-green-600">Submitted</span>
            ) : (
              <button onClick={() => setOpen(open === a.id ? null : a.id)}
                className="ml-auto rounded bg-blue-600 px-3 py-1 text-sm text-white">Submit</button>
            )}
          </div>
          {a.description && <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{a.description}</p>}

          {a.submission_id && (
            <div className="mt-2 rounded bg-gray-50 p-2 text-sm dark:bg-gray-800">
              <p className="whitespace-pre-wrap">{a.submission_content}</p>
              {a.marks_obtained !== null && (
                <p className="mt-1 font-semibold">
                  Marks: {a.marks_obtained} / {a.total_marks}
                  {a.feedback && <span className="ml-2 font-normal italic">"{a.feedback}"</span>}
                </p>
              )}
            </div>
          )}

          {open === a.id && !a.submission_id && (
            <form onSubmit={(e) => { e.preventDefault(); submit(a.id, new FormData(e.currentTarget)); }} className="mt-2 space-y-2">
              <textarea name="content" required rows={4} placeholder="Your answer…"
                className="w-full rounded border p-2 dark:bg-gray-800" />
              <button className="rounded bg-blue-600 px-4 py-1 text-white">Submit</button>
            </form>
          )}
        </div>
      ))}
    </div>
  );
}

function QuizzesTab() {
  const [list, setList] = useState<Quiz[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);

  async function load() {
    setList(await fetch('/api/student/quizzes').then((r) => r.json()));
  }
  useEffect(() => { load(); }, []);

  if (activeId) return <QuizRunner quizId={activeId} onDone={() => { setActiveId(null); load(); }} />;

  if (list.length === 0) return <p className="text-gray-500">No quizzes yet.</p>;
  return (
    <div className="space-y-2">
      {list.map((q) => (
        <div key={q.id} className="flex flex-wrap items-center gap-3 rounded border p-3 dark:border-gray-700">
          <span className="font-mono text-xs text-gray-500">{q.course_code}</span>
          <span className="font-semibold">{q.title}</span>
          <span className="text-sm text-gray-500">{q.question_count} Q · {q.total_marks} marks</span>
          {q.attempted_at ? (
            <span className="ml-auto text-sm text-green-600">Scored: {q.marks_obtained} / {q.total_marks}</span>
          ) : (
            <button onClick={() => setActiveId(q.id)} className="ml-auto rounded bg-blue-600 px-3 py-1 text-sm text-white">Start</button>
          )}
        </div>
      ))}
    </div>
  );
}

function QuizRunner({ quizId, onDone }: { quizId: number; onDone: () => void }) {
  const [data, setData] = useState<{
    quiz: { id: number; title: string; total_marks: number };
    questions: Array<{ id: number; question_text: string; option_a: string; option_b: string; option_c: string; option_d: string; marks: number }>;
  } | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ marksObtained: number; totalMarks: number } | null>(null);

  useEffect(() => {
    fetch(`/api/student/quizzes/${quizId}`).then((r) => r.json()).then(setData);
  }, [quizId]);

  async function submit() {
    const res = await fetch(`/api/student/quizzes/${quizId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
    const body = await res.json();
    if (!res.ok) { alert(body.error); onDone(); return; }
    setResult(body);
  }

  if (!data) return <p>Loading…</p>;
  if (result) {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-bold">{data.quiz.title} — Result</h2>
        <p className="text-lg">You scored <strong>{result.marksObtained} / {result.totalMarks}</strong>.</p>
        <button onClick={onDone} className="rounded bg-blue-600 px-4 py-2 text-white">Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{data.quiz.title}</h2>
      {data.questions.map((q, i) => (
        <div key={q.id} className="rounded border p-3 dark:border-gray-700">
          <p className="mb-2 font-semibold">{i + 1}. {q.question_text} <span className="text-xs text-gray-500">({q.marks} marks)</span></p>
          {(['a', 'b', 'c', 'd'] as const).map((k) => (
            <label key={k} className="block">
              <input type="radio" name={`q-${q.id}`} value={k.toUpperCase()}
                onChange={() => setAnswers({ ...answers, [String(q.id)]: k.toUpperCase() })} />
              <span className="ml-2">{k.toUpperCase()}. {q[`option_${k}` as 'option_a']}</span>
            </label>
          ))}
        </div>
      ))}
      <button onClick={submit} className="rounded bg-blue-600 px-4 py-2 text-white">Submit Quiz</button>
    </div>
  );
}

function FeeTab() {
  const [fee, setFee] = useState<Fee | null>(null);
  useEffect(() => {
    fetch('/api/student/fee').then((r) => r.json()).then(setFee);
  }, []);
  if (!fee) return <p>Loading…</p>;
  const remaining = fee.total_amount - fee.paid_amount;
  return (
    <div className="rounded border p-4 dark:border-gray-700">
      <p>Total Fee: <strong>PKR {fee.total_amount}</strong></p>
      <p>Paid: <strong>PKR {fee.paid_amount}</strong></p>
      <p>Remaining: <strong className={remaining > 0 ? 'text-red-600' : 'text-green-600'}>PKR {remaining}</strong></p>
      {fee.due_date && <p className="mt-2 text-sm text-gray-500">Due: {fee.due_date}</p>}
    </div>
  );
}