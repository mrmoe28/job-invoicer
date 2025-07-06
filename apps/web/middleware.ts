import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const response = NextResponse.next();

    // Apply security headers
    if (process.env.NODE_ENV === 'production') {
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-XSS-Protection', '1; mode=block');
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    }

    // For now, disable auth checks on Vercel to ensure the app loads
    // This is temporary until proper auth is configured
    return response;
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/settings/:path*',
        '/reports/:path*',
        '/api/:path*',
    ]
};