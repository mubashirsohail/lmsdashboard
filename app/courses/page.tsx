// app/courses/page.tsx
import { sql } from '@/lib/db';

export const instant = false; 
// export const dynamic = 'force-dynamic';

type CourseRow = {
  id: number;
  code: string;
  title: string;
  description: string | null;
  credit_hours: number;
  instructor_name: string | null;
};

export default async function CoursesPage() {
  const courses = (await sql`
    SELECT c.id, c.code, c.title, c.description, c.credit_hours,
           u.full_name AS instructor_name
    FROM courses c
    LEFT JOIN users u ON u.id = c.instructor_id
    ORDER BY c.code ASC
  `) as CourseRow[];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Available Courses</h1>
      {courses.length === 0 ? (
        <p className="text-gray-500">No courses yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((c) => (
            <div key={c.id} className="rounded-lg border p-4 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-gray-500">{c.code}</span>
                <span className="text-xs text-gray-500">{c.credit_hours} CH</span>
              </div>
              <h2 className="mt-1 text-lg font-semibold">{c.title}</h2>
              {c.description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{c.description}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Instructor: {c.instructor_name ?? 'To be announced'}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}