/**
 * Fallback auth middleware for cases where NextAuth is not properly configured
 * This allows the app to function in development or demo environments
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get path from request
  const path = request.nextUrl.pathname;
  
  // Only intercept API routes that require authentication
  if (path.startsWith('/api/') && 
      !path.startsWith('/api/auth/') && 
      !path.startsWith('/api/simple-auth/')) {
    
    // Get token from cookie or header
    const token = request.cookies.get('pulse-auth-token')?.value || 
                 request.headers.get('Authorization')?.replace('Bearer ', '');
    
    // If no token, check if this is a development or demo environment
    if (!token) {
      // For development and demo, allow access without token
      if (process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
        // Add demo user context to headers
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-auth-user-id', 'demo-user');
        requestHeaders.set('x-auth-organization-id', 'demo-org');
        
        // Return modified request
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }
      
      // Production environment with no token - return 401
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Token exists but NextAuth might not be working - add headers for context
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-auth-token', token);
    
    // Return modified request
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  // Non-API routes or auth routes - continue normally
  return NextResponse.next();
}

// Only run middleware on API routes
export const config = {
  matcher: '/api/:path*',
};
