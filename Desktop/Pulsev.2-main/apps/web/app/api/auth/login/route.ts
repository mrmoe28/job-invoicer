import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Simple login endpoint for testing
 * In production, this would validate credentials properly
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;
    
    // Very simple validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // For demo purposes, accept any credentials
    // In production, you would validate against a database
    const isDemoOrDev = process.env.NODE_ENV !== 'production' || 
                       process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    
    if (isDemoOrDev || (email === 'demo@example.com' && password === 'password')) {
      // Generate a simple token
      const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
      
      // Set cookie
      cookies().set({
        name: 'pulse-auth-token',
        value: token,
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      
      // Return user info
      return NextResponse.json({
        user: {
          id: 'demo-user-1',
          name: 'Demo User',
          email,
          organizationId: 'org-1',
        },
        token,
      });
    }
    
    // Invalid credentials
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
