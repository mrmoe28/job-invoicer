import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/customers',
  '/invoices',
  '/documents',
  '/schedule',
  '/profile',
  '/settings'
];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/signup'];

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/home',
  '/terms',
  '/privacy',
  '/handler', // Stack Auth routes
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if it's a Stack Auth handler route
  if (pathname.startsWith('/handler/')) {
    return NextResponse.next();
  }

  // Check if it's an API route - always allow
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check if it's a static file or Next.js internal route
  if (pathname.startsWith('/_next/') || pathname.startsWith('/static/') || pathname.includes('.')) {
    return NextResponse.next();
  }

  try {
    // Check if user is authenticated by looking for Stack Auth session cookie
    const hasStackAuthSession = request.cookies.has('stack-auth-session') ||
      request.cookies.has('stack-session') ||
      request.headers.get('authorization');

    // Handle protected routes
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
      if (!hasStackAuthSession) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('returnUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Handle auth routes (redirect to dashboard if already authenticated)
    if (authRoutes.some(route => pathname === route)) {
      if (hasStackAuthSession) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Allow public routes
    if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // For any other routes, allow them to pass through
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, allow the request to continue
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - file extensions (js, css, ico, png, jpg, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|.*\\.).*)',
  ],
}; 