'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';

export default function Admin2AutoLoginPage() {
  const router = useRouter();

  // tRPC mutation hook for login
  const loginMutation = trpc.login.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        // Store user session
        localStorage.setItem('pulse_user', JSON.stringify({
          id: result.user.id,
          email: result.user.email,
          name: `${result.user.firstName} ${result.user.lastName}`,
          role: result.user.role,
          organizationId: result.user.organizationId,
          organizationName: result.organization.name,
          organizationSlug: result.organization.slug,
          plan: result.organization.plan,
        }));

        // Set session flag to indicate successful authentication
        localStorage.setItem('pulse_session_active', 'true');
        
        // Redirect to dashboard
        router.push('/dashboard');
      }
    },
    onError: (error) => {
      console.error('Auto-login failed:', error);
      // Fallback to regular login page with pre-filled credentials
      router.push('/auth?admin2=true');
    },
  });

  useEffect(() => {
    // Automatically login with admin2 credentials
    loginMutation.mutate({
      email: 'admin2@pulsecrm.local',
      password: 'admin456'
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h1 className="text-3xl font-bold text-white">
            Pulse<span className="text-orange-500">CRM</span>
          </h1>
        </div>

        {/* Auto-login message */}
        <div className="space-y-4">
          <h2 className="text-xl text-white font-semibold">Admin Access Portal</h2>
          <p className="text-gray-300">Automatically logging you in...</p>
          
          {/* Loading spinner */}
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
          
          {/* Admin info */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mt-6">
            <div className="text-sm text-gray-400 mb-2">Logging in as:</div>
            <div className="text-white font-medium">Sarah Administrator</div>
            <div className="text-gray-300 text-sm">admin2@pulsecrm.local</div>
            <div className="text-orange-500 text-sm mt-1">Demo Construction Company</div>
          </div>

          {/* Fallback link */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Having trouble?</p>
            <button 
              onClick={() => router.push('/auth')}
              className="text-orange-500 hover:text-orange-400 text-sm underline"
            >
              Go to manual login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}