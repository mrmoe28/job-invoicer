import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Authentication middleware
 * Provides a simplified authentication mechanism that works across all environments
 */
export function middleware(request: NextRequest) {
  // Get path from request
  const path = request.nextUrl.pathname;
  
  // Public paths that don't require authentication
  const publicPaths = [
    '/login',
    '/auth',
    '/api/auth',      // Include all auth endpoints as public
    '/test-upload',
    '/api/documents/upload-simple',
    '/api/files',
  ];
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  );
  
  // Always allow public paths
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Get token from cookie or header
  const token = request.cookies.get('pulse-auth-token')?.value || 
               request.cookies.get('next-auth.session-token')?.value ||
               request.cookies.get('__Secure-next-auth.session-token')?.value ||
               request.headers.get('Authorization')?.replace('Bearer ', '');
  
  // For API routes, check if token exists
  if (path.startsWith('/api/')) {
    // If no token in production, return 401
    if (!token && process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // For development or demo mode, allow access with demo user context
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-auth-user-id', token ? 'user-from-token' : 'demo-user');
    requestHeaders.set('x-auth-organization-id', 'org-1');
    
    // Return modified request
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  // For page routes, redirect to login if no token
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', path);
    return NextResponse.redirect(loginUrl);
  }
  
  // User is authenticated, allow access
  return NextResponse.next();
}

// Only run middleware on relevant paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|uploads|assets|images).*)',
  ],
};
