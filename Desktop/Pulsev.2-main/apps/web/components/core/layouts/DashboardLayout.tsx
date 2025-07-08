'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { TopNavigation } from './TopNavigation';
import { Sidebar } from './Sidebar';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorBoundary } from '../ErrorBoundary';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showSidebar?: boolean;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  showSidebar = true,
  sidebarCollapsed = false,
  onSidebarToggle,
}: DashboardLayoutProps) {
  const { user, isLoading, isAuthenticated, requireAuth } = useAuth();

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Redirect handling is done in useAuth
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Top Navigation */}
        <TopNavigation
          user={user}
          onSidebarToggle={onSidebarToggle}
          showSidebarToggle={showSidebar}
        />

        <div className="flex">
          {/* Sidebar */}
          {showSidebar && (
            <Sidebar
              collapsed={sidebarCollapsed}
              onToggle={onSidebarToggle}
            />
          )}

          {/* Main Content */}
          <main
            className={`
              flex-1 transition-all duration-300
              ${showSidebar ? (sidebarCollapsed ? 'ml-16' : 'ml-64') : ''}
              pt-16 p-6
            `}
          >
            {/* Page Header */}
            {(title || subtitle) && (
              <div className="mb-6">
                {title && (
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-gray-500 dark:text-gray-400">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {/* Page Content */}
            <div className="space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}