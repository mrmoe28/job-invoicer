import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Logout endpoint
 */
export async function POST(request: NextRequest) {
  // Clear the auth cookie
  cookies().delete('pulse-auth-token');
  cookies().delete('next-auth.session-token');
  cookies().delete('__Secure-next-auth.session-token');
  
  return NextResponse.json({ success: true });
}

// Also support GET for simplicity
export async function GET(request: NextRequest) {
  // Clear the auth cookie
  cookies().delete('pulse-auth-token');
  cookies().delete('next-auth.session-token');
  cookies().delete('__Secure-next-auth.session-token');
  
  // Redirect to login page
  return NextResponse.redirect(new URL('/login', request.url));
}
