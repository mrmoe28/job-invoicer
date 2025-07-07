'use client';

import { useEffect } from 'react';

/**
 * This component detects and handles common Next.js chunk loading errors in the browser
 */
export default function ErrorHandler({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Function to handle chunk load errors
    const handleChunkError = (event: ErrorEvent) => {
      // Check if this is a chunk loading error
      const isChunkLoadError = event.message && (
        event.message.includes('Loading chunk') || 
        event.message.includes('Loading CSS chunk') ||
        event.message.includes('Failed to fetch')
      );
      
      if (isChunkLoadError) {
        console.log('Detected chunk loading error - refreshing application...');
        
        // Clear cache and reload
        if ('caches' in window) {
          caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
              return caches.delete(key);
            }));
          }).then(() => {
            // Reload the page without cache
            window.location.reload();
          });
        } else {
          // Fallback for browsers without Cache API
          window.location.reload();
        }
      }
    };
    
    // Add error event listener
    window.addEventListener('error', handleChunkError);
    
    // Clean up
    return () => {
      window.removeEventListener('error', handleChunkError);
    };
  }, []);
  
  return children;
}
