import { authOptions } from '@/lib/auth/options';
import NextAuth from 'next-auth';

/**
 * This handler is for compatibility with older code that might still use the Pages Router
 * The main auth implementation is now in the App Router
 */
export default NextAuth(authOptions);
