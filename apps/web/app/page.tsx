'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('pulse_user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        // Check if user has valid credentials
        if (user.username && user.name) {
          router.replace('/dashboard');
        } else {
          // Invalid user data, redirect to auth
          localStorage.removeItem('pulse_user');
          router.replace('/auth');
        }
      } catch {
        // Invalid JSON, redirect to auth
        localStorage.removeItem('pulse_user');
        router.replace('/auth');
      }
    } else {
      router.replace('/auth');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  );
}
<!-- Auto-deploy test Mon Jun 30 18:07:33 EDT 2025 -->
