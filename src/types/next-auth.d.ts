import NextAuth, { type DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'ADMIN' | 'GUEST';
    } & DefaultSession['user'];
  }

  interface User {
    role: 'ADMIN' | 'GUEST';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'ADMIN' | 'GUEST';
  }
}
