'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopNavigation from './top-navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const [user, setUser] = useState<unknown>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('pulse_user');
    const sessionActive = localStorage.getItem('pulse_session_active');
    
    if (!userData || sessionActive !== 'true') {
      router.push('/auth');
      return;
    }
    
    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth');
    }
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <TopNavigation user={user} />
      
      <main className="p-6">
        {(title || subtitle) && (
          <div className="mb-6">
            {title && (
              <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
            )}
            {subtitle && (
              <p className="text-gray-400">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
