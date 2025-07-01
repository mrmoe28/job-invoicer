'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Admin2AutoLoginPage() {
  const router = useRouter();
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [loginStatus, setLoginStatus] = useState('Connecting...');

  useEffect(() => {
    // Only attempt login once
    if (!loginAttempted) {
      console.log('Attempting auto-login for admin2');
      setLoginAttempted(true);
      setLoginStatus('Logging in...');
      
      // Simulate login process
      setTimeout(() => {
        try {
          // Use the same hardcoded logic as the auth page
          const userData = {
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

          localStorage.setItem('pulse_user', JSON.stringify(userData));
          localStorage.setItem('pulse_session_active', 'true');
          
          setLoginStatus('Login successful! Redirecting...');
          
          // Redirect to dashboard
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
          
        } catch (error) {
          console.error('Auto-login failed:', error);
          setLoginStatus('Login failed. Redirecting to manual login...');
          
          // Fallback to regular login page
          setTimeout(() => {
            router.push('/auth?admin2=true');
          }, 2000);
        }
      }, 1500); // Simulate network delay
    }
  }, [loginAttempted, router]);

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
          <p className="text-gray-300">{loginStatus}</p>
          
          {/* Loading spinner - show during initial loading */}
          {loginStatus.includes('Connecting') || loginStatus.includes('Logging in') ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : loginStatus.includes('successful') ? (
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          ) : loginStatus.includes('failed') ? (
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          ) : null}
          
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