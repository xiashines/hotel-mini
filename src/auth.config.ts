import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith('/admin');
      
      if (isAdminRoute) {
        if (isLoggedIn) {
          // Check if user is admin
          // NextAuth user object needs to have role property
          if (auth.user.role === 'ADMIN') return true;
          return Response.redirect(new URL('/', nextUrl)); // Redirect guest from admin
        }
        return false; // Redirect to login
      }
      
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      if (session.user && token.role) {
        session.user.role = token.role as 'ADMIN' | 'GUEST';
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    }
  },
  trustHost: true,
  providers: [], // Add providers in auth.ts
} satisfies NextAuthConfig;
