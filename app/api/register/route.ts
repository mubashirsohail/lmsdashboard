// app/api/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, fullName, role, program, semester, department, designation } = body;

    // Validation
    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Email, password and full name are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    if (role !== 'student' && role !== 'instructor') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [newUser] = await sql`
      INSERT INTO users (email, password_hash, full_name, role, status)
      VALUES (${email}, ${passwordHash}, ${fullName}, ${role}, 'pending')
      RETURNING id
    `;

    if (role === 'student') {
      await sql`
        INSERT INTO student_profiles (user_id, program, semester)
        VALUES (${newUser.id}, ${program ?? null}, ${semester ?? null})
      `;
    } else {
      await sql`
        INSERT INTO instructor_profiles (user_id, department, designation)
        VALUES (${newUser.id}, ${department ?? null}, ${designation ?? null})
      `;
    }

    return NextResponse.json({ message: 'Application submitted. Wait for admin approval.' }, { status: 201 });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}