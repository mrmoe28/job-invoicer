'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TopNavigation from './top-navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Handle loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Handle unauthenticated state
  if (status === 'unauthenticated' || !session?.user) {
    router.push('/auth');
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TopNavigation user={{
        name: session.user.name || undefined,
        username: session.user.email || undefined,
        avatar: session.user.image || undefined,
        role: 'User'
      }} />

      <main className="p-6">
        {(title || subtitle) && (
          <div className="mb-6">
            {title && (
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
            )}
            {subtitle && (
              <p className="text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
