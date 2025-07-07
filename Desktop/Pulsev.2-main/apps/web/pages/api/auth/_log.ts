import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Simple log endpoint for Next-Auth
 * This handles the _log requests from the client
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Accept all methods
  if (req.method === 'POST') {
    // Log the error (in production you might want to store these logs)
    if (process.env.NODE_ENV === 'development') {
      console.log('Next-Auth Client Log:', req.body);
    }
    
    // Always return success
    return res.status(200).json({ success: true });
  }
  
  // For any other method, return empty success
  return res.status(200).json({ success: true });
}
