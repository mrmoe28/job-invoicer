import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from './lib/rate-limit';
import { productionConfig } from './lib/config/production';

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
        
        // Content Security Policy
        const csp = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https: blob:",
            "font-src 'self'",
            "connect-src 'self' https://vercel.live wss://vercel.live",
            "frame-ancestors 'none'",
        ].join('; ');
        
        response.headers.set('Content-Security-Policy', csp);
    }

    // Rate limiting for API routes
    if (pathname.startsWith('/api/') && productionConfig.security.rateLimitEnabled) {
        const rateLimitConfig = {
            interval: 60 * 1000, // 1 minute
            uniqueTokenPerInterval: pathname.includes('auth') ? 5 : 60, // Stricter for auth endpoints
        };
        
        const { success, limit, remaining, reset } = await checkRateLimit(req, rateLimitConfig);
        
        response.headers.set('X-RateLimit-Limit', limit.toString());
        response.headers.set('X-RateLimit-Remaining', remaining.toString());
        response.headers.set('X-RateLimit-Reset', reset.toString());
        
        if (!success) {
            return new NextResponse(
                JSON.stringify({ error: 'Too many requests' }),
                { 
                    status: 429,
                    headers: response.headers,
                }
            );
        }
    }

    // Check if this is a protected route
    const isProtectedRoute = pathname.startsWith('/dashboard') ||
        pathname.startsWith('/settings') ||
        pathname.startsWith('/reports');

    if (isProtectedRoute) {
        // For protected routes, check if user has session data in cookies
        const sessionCookie = req.cookies.get('pulse_session_active');
        const userCookie = req.cookies.get('pulse_user');

        // If no session cookies, redirect to auth
        if (!sessionCookie || sessionCookie.value !== 'true' || !userCookie) {
            console.log("No valid session found, redirecting to auth");
            const authUrl = new URL('/auth', req.url);
            return NextResponse.redirect(authUrl);
        }
    }

    // Maintenance mode
    if (process.env.MAINTENANCE_MODE === 'true' && !pathname.startsWith('/maintenance')) {
        const maintenanceUrl = new URL('/maintenance', req.url);
        return NextResponse.redirect(maintenanceUrl);
    }

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
