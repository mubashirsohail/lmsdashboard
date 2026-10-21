// auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const rows = await sql`
          SELECT id, email, password_hash, full_name, role, status
          FROM users
          WHERE email = ${email}
          LIMIT 1
        `;
        const user = rows[0];
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;

        // Block non-approved accounts
        if (user.status !== 'approved') return null;

        return {
          id: String(user.id),
          email: user.email,
          name: user.full_name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});