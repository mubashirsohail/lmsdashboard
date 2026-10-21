// app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';

type Application = {
  id: number; email: string; full_name: string; role: string; created_at: string;
  program?: string; semester?: number; department?: string; designation?: string;
};
type Course = {
  id: number; code: string; title: string; description: string;
  credit_hours: number; instructor_id: number | null; instructor_name: string | null;
};
type User = {
  id: number; email: string; full_name: string; role: string; status: string;
  total_amount: number | null; paid_amount: number | null; due_date: string | null;
};

export default function AdminPage() {
  const [tab, setTab] = useState<'apps' | 'courses' | 'users'>('apps');

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>
      <div className="mb-6 flex gap-2 border-b dark:border-gray-700">
        {(['apps', 'courses', 'users'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm ${tab === t ? 'border-b-2 border-blue-600 font-semibold' : ''}`}
          >
            {t === 'apps' ? 'Applications' : t === 'courses' ? 'Courses' : 'Users & Fees'}
          </button>
        ))}
      </div>
      {tab === 'apps' && <ApplicationsTab />}
      {tab === 'courses' && <CoursesTab />}
      {tab === 'users' && <UsersTab />}
    </main>
  );
}

function ApplicationsTab() {
  const [apps, setApps] = useState<Application[]>([]);

  async function load() {
    setApps(await fetch('/api/admin/applications').then((r) => r.json()));
  }
  useEffect(() => { load(); }, []);

  async function decide(id: number, action: 'approve' | 'reject') {
    await fetch(`/api/admin/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    load();
  }

  return (
    <div className="space-y-3">
      {apps.length === 0 && <p className="text-gray-500">No pending applications.</p>}
      {apps.map((a) => (
        <div key={a.id} className="rounded border p-4 dark:border-gray-700">
          <p className="font-semibold">{a.full_name} <span className="text-sm text-gray-500">({a.role})</span></p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{a.email}</p>
          {a.role === 'student' && <p className="text-sm">Program: {a.program ?? '—'} · Semester: {a.semester ?? '—'}</p>}
          {a.role === 'instructor' && <p className="text-sm">Dept: {a.department ?? '—'} · {a.designation ?? '—'}</p>}
          <div className="mt-2 flex gap-2">
            <button onClick={() => decide(a.id, 'approve')} className="rounded bg-green-600 px-3 py-1 text-white">Approve</button>
            <button onClick={() => decide(a.id, 'reject')} className="rounded bg-red-600 px-3 py-1 text-white">Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CoursesTab() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [form, setForm] = useState({ code: '', title: '', description: '', creditHours: 3, instructorId: '' });

  async function load() {
    setCourses(await fetch('/api/admin/courses').then((r) => r.json()));
    const users = await fetch('/api/admin/users').then((r) => r.json());
    setInstructors(users.filter((u: User) => u.role === 'instructor' && u.status === 'approved'));
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/admin/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        instructorId: form.instructorId ? Number(form.instructorId) : null,
      }),
    });
    setForm({ code: '', title: '', description: '', creditHours: 3, instructorId: '' });
    load();
  }

  async function remove(id: number) {
    if (!confirm('Delete course?')) return;
    await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
    load();
  }

  async function assign(courseId: number, instructorId: string) {
    await fetch(`/api/admin/courses/${courseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instructorId: instructorId ? Number(instructorId) : null }),
    });
    load();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="grid gap-2 md:grid-cols-5">
        <input placeholder="Code (CS101)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required className="rounded border p-2 dark:bg-gray-800" />
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="rounded border p-2 dark:bg-gray-800" />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded border p-2 dark:bg-gray-800" />
        <input type="number" min={1} value={form.creditHours} onChange={(e) => setForm({ ...form, creditHours: Number(e.target.value) })} className="rounded border p-2 dark:bg-gray-800" />
        <button className="rounded bg-blue-600 px-4 py-2 text-white">Add Course</button>
      </form>

      <div className="space-y-2">
        {courses.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center gap-3 rounded border p-3 dark:border-gray-700">
            <span className="font-mono">{c.code}</span>
            <span className="font-semibold">{c.title}</span>
            <span className="text-sm text-gray-500">{c.credit_hours} CH</span>
            <select
              value={c.instructor_id ?? ''}
              onChange={(e) => assign(c.id, e.target.value)}
              className="rounded border p-1 text-sm dark:bg-gray-800"
            >
              <option value="">— Unassigned —</option>
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>{i.full_name}</option>
              ))}
            </select>
            <button onClick={() => remove(c.id)} className="ml-auto rounded bg-red-600 px-3 py-1 text-sm text-white">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<User | null>(null);

  async function load() {
    setUsers(await fetch('/api/admin/users').then((r) => r.json()));
    setCourses(await fetch('/api/admin/courses').then((r) => r.json()));
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id: number, status: 'approved' | 'deactivated') {
    await fetch(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function enroll(studentId: number, courseId: string) {
    if (!courseId) return;
    const res = await fetch(`/api/admin/users/${studentId}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: Number(courseId) }),
    });
    alert(res.ok ? 'Enrolled' : 'Already enrolled');
  }

  async function saveFee(studentId: number, form: FormData) {
    await fetch(`/api/admin/users/${studentId}/fee`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        totalAmount: Number(form.get('total')),
        paidAmount: Number(form.get('paid')),
        dueDate: form.get('due') || null,
      }),
    });
    load();
    setSelected(null);
  }

  return (
    <div className="space-y-2">
      {users.map((u) => (
        <div key={u.id} className="rounded border p-3 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold">{u.full_name}</span>
            <span className="text-sm text-gray-500">{u.email} · {u.role} · {u.status}</span>
            <button
              onClick={() => setStatus(u.id, u.status === 'approved' ? 'deactivated' : 'approved')}
              className="ml-auto rounded border px-2 py-1 text-xs dark:border-gray-600"
            >
              {u.status === 'approved' ? 'Deactivate' : 'Activate'}
            </button>
          </div>

          {u.role === 'student' && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span>Fee: PKR {u.paid_amount ?? 0} / {u.total_amount ?? 0}</span>
              <button onClick={() => setSelected(u)} className="rounded border px-2 py-1 text-xs dark:border-gray-600">Edit Fee</button>
              <select onChange={(e) => { enroll(u.id, e.target.value); e.target.value = ''; }} className="rounded border p-1 text-xs dark:bg-gray-800">
                <option value="">Enroll in course…</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.code} {c.title}</option>)}
              </select>
            </div>
          )}

          {selected?.id === u.id && (
            <form
              onSubmit={(e) => { e.preventDefault(); saveFee(u.id, new FormData(e.currentTarget)); }}
              className="mt-2 flex flex-wrap gap-2"
            >
              <input name="total" type="number" defaultValue={u.total_amount ?? 0} placeholder="Total" className="rounded border p-1 text-sm dark:bg-gray-800" />
              <input name="paid" type="number" defaultValue={u.paid_amount ?? 0} placeholder="Paid" className="rounded border p-1 text-sm dark:bg-gray-800" />
              <input name="due" type="date" defaultValue={u.due_date ?? ''} className="rounded border p-1 text-sm dark:bg-gray-800" />
              <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white">Save</button>
              <button type="button" onClick={() => setSelected(null)} className="rounded border px-3 py-1 text-sm dark:border-gray-600">Cancel</button>
            </form>
          )}
        </div>
      ))}
    </div>
  );
}