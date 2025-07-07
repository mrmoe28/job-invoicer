import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Legacy API route for NextAuth session
 * This handles the session endpoint in the pages directory for compatibility
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check for any auth cookies
  const hasAuthCookie = req.cookies['next-auth.session-token'] || 
                       req.cookies['__Secure-next-auth.session-token'] ||
                       req.cookies['pulse-auth-token'];
  
  // For demo/development, provide a working session
  const isDemoOrDev = process.env.NODE_ENV !== 'production' || 
                     process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (hasAuthCookie || isDemoOrDev) {
    // Return a valid session
    return res.status(200).json({
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
  return res.status(200).json({
    user: null,
    expires: null,
  });
}
