import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    console.log("Middleware executed for:", pathname);

    // Check if this is a protected route
    const isProtectedRoute = pathname.startsWith('/dashboard') ||
        pathname.startsWith('/settings') ||
        pathname.startsWith('/reports');

    if (isProtectedRoute) {
        // For protected routes, check if user has session data in cookies
        // Since we can't access localStorage in middleware, we'll rely on a session cookie
        const sessionCookie = req.cookies.get('pulse_session_active');
        const userCookie = req.cookies.get('pulse_user');

        // If no session cookies, redirect to auth
        if (!sessionCookie || sessionCookie.value !== 'true' || !userCookie) {
            console.log("No valid session found, redirecting to auth");
            const authUrl = new URL('/auth', req.url);
            return NextResponse.redirect(authUrl);
        }
    }

    // Allow the request to continue
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/settings/:path*',
        '/reports/:path*',
    ]
}; 