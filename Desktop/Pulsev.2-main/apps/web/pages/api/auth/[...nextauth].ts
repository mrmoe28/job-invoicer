import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

/**
 * Basic Next-Auth configuration for compatibility
 */
export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Simple validation for demo/dev
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // For demo purposes, accept default credentials
        const isDemoOrDev = process.env.NODE_ENV !== 'production' || 
                           process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
        
        if (isDemoOrDev || (credentials.email === 'demo@example.com' && credentials.password === 'password')) {
          return {
            id: 'demo-user-1',
            name: 'Demo User',
            email: credentials.email,
            image: null,
            organizationId: 'org-1',
          };
        }
        
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.organizationId = user.organizationId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.organizationId = token.organizationId;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
});
