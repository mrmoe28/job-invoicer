import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';

/**
 * Session endpoint for authentication
 * Provides session data in the format NextAuth expects
 */
export async function GET(request: NextRequest) {
  try {
    // Try to get the session from NextAuth
    const session = await getServerSession(authOptions);
    
    // If we have a session, return it
    if (session) {
      return NextResponse.json(session);
    }
    
    // For demo/development, provide a working session
    const isDemoOrDev = process.env.NODE_ENV !== 'production' || 
                      process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    
    if (isDemoOrDev) {
      // Return a valid session for development
      return NextResponse.json({
        user: {
          id: 'demo-user-1',
          name: 'Demo User',
          email: 'demo@example.com',
          image: null,
          organizationId: 'org-1',
        },
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    
    // No valid session
    return NextResponse.json({
      user: null,
      expires: null,
    });
  } catch (error) {
    console.error("Session API error:", error);
    return NextResponse.json({ user: null, expires: null });
  }
}
