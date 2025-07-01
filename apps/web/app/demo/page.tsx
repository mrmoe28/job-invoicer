'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DemoAccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Instant admin login and redirect
    const adminData = {
      id: 'admin-2',
      email: 'admin2@pulsecrm.local',
      name: 'Sarah Administrator',
      username: 'admin2',
      role: 'Administrator',
      organizationId: 'org-admin',
      organizationName: 'Demo Construction Company',
      organizationSlug: 'demo-construction',
      plan: 'pro',
      loginTime: new Date().toISOString(),
    };

    localStorage.setItem('pulse_user', JSON.stringify(adminData));
    localStorage.setItem('pulse_session_active', 'true');
    
    // Immediate redirect to dashboard
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-300">Loading demo...</p>
      </div>
    </div>
  );
}