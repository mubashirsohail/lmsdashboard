// app/instructor/page.tsx
'use client';

import { useEffect, useState } from 'react';

type Course = { id: number; code: string; title: string; credit_hours: number };
type Assignment = {
  id: number; course_id: number; title: string; description: string;
  total_marks: number; due_date: string | null; course_code: string;
};
type Quiz = { id: number; title: string; total_marks: number; course_code: string; question_count: number };
type Submission = {
  id: number; content: string; submitted_at: string; marks_obtained: number | null;
  feedback: string | null; student_name: string; student_email: string;
};

export default function InstructorPage() {
  const [tab, setTab] = useState<'courses' | 'assignments' | 'quizzes'>('courses');

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Instructor Dashboard</h1>
      <div className="mb-6 flex gap-2 border-b dark:border-gray-700">
        {(['courses', 'assignments', 'quizzes'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize ${tab === t ? 'border-b-2 border-blue-600 font-semibold' : ''}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === 'courses' && <CoursesTab />}
      {tab === 'assignments' && <AssignmentsTab />}
      {tab === 'quizzes' && <QuizzesTab />}
    </main>
  );
}

function CoursesTab() {
  const [courses, setCourses] = useState<Course[]>([]);
  useEffect(() => {
    fetch('/api/instructor/courses').then((r) => r.json()).then(setCourses);
  }, []);
  return (
    <div className="space-y-2">
      {courses.length === 0 && <p className="text-gray-500">No courses assigned yet. Ask the admin.</p>}
      {courses.map((c) => (
        <div key={c.id} className="rounded border p-3 dark:border-gray-700">
          <span className="font-mono">{c.code}</span> — <span className="font-semibold">{c.title}</span>
          <span className="ml-2 text-sm text-gray-500">({c.credit_hours} CH)</span>
        </div>
      ))}
    </div>
  );
}

function AssignmentsTab() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [list, setList] = useState<Assignment[]>([]);
  const [form, setForm] = useState({ courseId: '', title: '', description: '', totalMarks: 100, dueDate: '' });
  const [openId, setOpenId] = useState<number | null>(null);

  async function load() {
    setCourses(await fetch('/api/instructor/courses').then((r) => r.json()));
    setList(await fetch('/api/instructor/assignments').then((r) => r.json()));
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!form.courseId) return;
    await fetch('/api/instructor/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId: Number(form.courseId),
        title: form.title,
        description: form.description,
        totalMarks: form.totalMarks,
        dueDate: form.dueDate || null,
      }),
    });
    setForm({ courseId: '', title: '', description: '', totalMarks: 100, dueDate: '' });
    load();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="grid gap-2 md:grid-cols-6">
        <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} required className="rounded border p-2 dark:bg-gray-800">
          <option value="">Course…</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}
        </select>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="rounded border p-2 dark:bg-gray-800" />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded border p-2 dark:bg-gray-800" />
        <input type="number" min={1} value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })} className="rounded border p-2 dark:bg-gray-800" />
        <input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="rounded border p-2 dark:bg-gray-800" />
        <button className="rounded bg-blue-600 px-4 py-2 text-white">Add</button>
      </form>

      <div className="space-y-2">
        {list.map((a) => (
          <div key={a.id} className="rounded border p-3 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-gray-500">{a.course_code}</span>
              <span className="font-semibold">{a.title}</span>
              <span className="text-sm text-gray-500">{a.total_marks} marks</span>
              <button onClick={() => setOpenId(openId === a.id ? null : a.id)}
                className="ml-auto rounded border px-2 py-1 text-xs dark:border-gray-600">
                {openId === a.id ? 'Hide' : 'Submissions'}
              </button>
            </div>
            {openId === a.id && <SubmissionsPanel assignmentId={a.id} maxMarks={a.total_marks} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function SubmissionsPanel({ assignmentId, maxMarks }: { assignmentId: number; maxMarks: number }) {
  const [subs, setSubs] = useState<Submission[]>([]);
  async function load() {
    setSubs(await fetch(`/api/instructor/assignments/${assignmentId}/submissions`).then((r) => r.json()));
  }
  useEffect(() => { load(); }, [assignmentId]);

  async function grade(submissionId: number, form: FormData) {
    await fetch(`/api/instructor/assignments/${assignmentId}/submissions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissionId,
        marks: Number(form.get('marks')),
        feedback: form.get('feedback') || null,
      }),
    });
    load();
  }

  if (subs.length === 0) return <p className="mt-2 text-sm text-gray-500">No submissions yet.</p>;
  return (
    <div className="mt-3 space-y-2">
      {subs.map((s) => (
        <div key={s.id} className="rounded bg-gray-50 p-2 text-sm dark:bg-gray-800">
          <p className="font-semibold">{s.student_name} <span className="text-gray-500">({s.student_email})</span></p>
          <p className="my-1 whitespace-pre-wrap">{s.content}</p>
          <form onSubmit={(e) => { e.preventDefault(); grade(s.id, new FormData(e.currentTarget)); }} className="flex flex-wrap gap-2">
            <input name="marks" type="number" min={0} max={maxMarks} defaultValue={s.marks_obtained ?? ''} placeholder={`/ ${maxMarks}`} className="w-24 rounded border p-1 dark:bg-gray-900" required />
            <input name="feedback" defaultValue={s.feedback ?? ''} placeholder="Feedback" className="flex-1 rounded border p-1 dark:bg-gray-900" />
            <button className="rounded bg-blue-600 px-3 py-1 text-white">Save</button>
          </form>
        </div>
      ))}
    </div>
  );
}

function QuizzesTab() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [list, setList] = useState<Quiz[]>([]);
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Array<{
    questionText: string; optionA: string; optionB: string; optionC: string; optionD: string;
    correctOption: 'A' | 'B' | 'C' | 'D'; marks: number;
  }>>([{ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', marks: 1 }]);

  async function load() {
    setCourses(await fetch('/api/instructor/courses').then((r) => r.json()));
    setList(await fetch('/api/instructor/quizzes').then((r) => r.json()));
  }
  useEffect(() => { load(); }, []);

  function updateQ(i: number, patch: Partial<typeof questions[number]>) {
    setQuestions(questions.map((q, idx) => idx === i ? { ...q, ...patch } : q));
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId) return;
    const res = await fetch('/api/instructor/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: Number(courseId), title, questions }),
    });
    if (!res.ok) { alert('Failed'); return; }
    setTitle('');
    setCourseId('');
    setQuestions([{ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', marks: 1 }]);
    load();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="space-y-3 rounded border p-4 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} required className="rounded border p-2 dark:bg-gray-800">
            <option value="">Course…</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}
          </select>
          <input placeholder="Quiz title" value={title} onChange={(e) => setTitle(e.target.value)} required className="flex-1 rounded border p-2 dark:bg-gray-800" />
        </div>

        {questions.map((q, i) => (
          <div key={i} className="space-y-2 rounded bg-gray-50 p-3 dark:bg-gray-800">
            <input placeholder={`Question ${i + 1}`} value={q.questionText} onChange={(e) => updateQ(i, { questionText: e.target.value })} required className="w-full rounded border p-2 dark:bg-gray-900" />
            <div className="grid grid-cols-2 gap-2">
              {(['A', 'B', 'C', 'D'] as const).map((k) => (
                <input key={k} placeholder={`Option ${k}`} value={q[`option${k}`]} onChange={(e) => updateQ(i, { [`option${k}`]: e.target.value } as never)} required className="rounded border p-2 dark:bg-gray-900" />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={q.correctOption} onChange={(e) => updateQ(i, { correctOption: e.target.value as 'A' | 'B' | 'C' | 'D' })} className="rounded border p-2 dark:bg-gray-900">
                {(['A', 'B', 'C', 'D'] as const).map((k) => <option key={k} value={k}>Correct: {k}</option>)}
              </select>
              <input type="number" min={1} value={q.marks} onChange={(e) => updateQ(i, { marks: Number(e.target.value) })} className="w-24 rounded border p-2 dark:bg-gray-900" />
              <button type="button" onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))} className="rounded border px-3 text-red-600 dark:border-gray-600" disabled={questions.length === 1}>Remove</button>
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <button type="button" onClick={() => setQuestions([...questions, { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', marks: 1 }])}
            className="rounded border px-3 py-1 text-sm dark:border-gray-600">+ Add question</button>
          <button className="rounded bg-blue-600 px-4 py-1 text-white">Create Quiz</button>
        </div>
      </form>

      <div className="space-y-2">
        {list.map((q) => (
          <div key={q.id} className="rounded border p-3 dark:border-gray-700">
            <span className="font-mono text-xs text-gray-500">{q.course_code}</span>
            <span className="ml-2 font-semibold">{q.title}</span>
            <span className="ml-2 text-sm text-gray-500">{q.question_count} questions · {q.total_marks} marks</span>
          </div>
        ))}
      </div>
    </div>
  );
}