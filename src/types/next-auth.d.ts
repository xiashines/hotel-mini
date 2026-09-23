import { type DefaultSession } from 'next-auth';

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
