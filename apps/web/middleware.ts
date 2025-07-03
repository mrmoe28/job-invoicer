import { withAuth } from "next-auth/middleware";

export default withAuth(
    function middleware(req) {
        // Add any additional middleware logic here
        console.log("Middleware executed for:", req.nextUrl.pathname);
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // Check if user is authenticated for protected routes
                if (req.nextUrl.pathname.startsWith('/dashboard')) {
                    return !!token;
                }
                return true;
            },
        },
    }
);

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/settings/:path*',
        '/reports/:path*',
    ]
}; 