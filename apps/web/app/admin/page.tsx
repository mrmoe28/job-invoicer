'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminAccessPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    // Auto-login sequence for admin user
    const performAutoLogin = async () => {
      try {
        setStatus('Authenticating...');
        
        // Simulate brief loading for better UX
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Set admin session data
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
        
        setStatus('Access granted! Redirecting...');
        
        // Brief success display before redirect
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Redirect to dashboard
        router.push('/dashboard');
        
      } catch (error) {
        console.error('Admin access failed:', error);
        setStatus('Access failed. Redirecting to login...');
        
        // Fallback to manual login
        setTimeout(() => {
          router.push('/auth?admin2=true');
        }, 2000);
      }
    };

    performAutoLogin();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Main Card */}
        <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v-2H7v-2H4a1 1 0 01-1-1v-1m0 0V9a6 6 0 016-6h2a1 1 0 011 1v3m0 0v3a6 6 0 01-7.743 5.743L11 17H9v-2H7v-2H4a1 1 0 01-1-1v-1m0 0V9a6 6 0 016-6h2a1 1 0 011 1v3" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Admin Access Portal
            </h1>
            <p className="text-gray-300 text-sm">
              Secure administrative access to PulseCRM
            </p>
          </div>

          {/* Status Display */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-3 bg-gray-700/50 rounded-full px-6 py-3 border border-gray-600/50">
              {/* Loading Spinner */}
              {status.includes('Initializing') || status.includes('Authenticating') ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-orange-500 border-t-transparent"></div>
              ) : status.includes('granted') ? (
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : status.includes('failed') ? (
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              ) : (
                <div className="w-5 h-5 bg-blue-500 rounded-full animate-pulse"></div>
              )}
              
              <span className="text-white font-medium text-sm">{status}</span>
            </div>
          </div>

          {/* Admin Profile Card */}
          <div className="bg-gradient-to-r from-gray-700/50 to-gray-600/30 rounded-xl p-6 border border-gray-600/30 mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-semibold text-lg">SA</span>
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold">Sarah Administrator</div>
                <div className="text-gray-300 text-sm">admin2@pulsecrm.local</div>
                <div className="text-orange-400 text-xs font-medium mt-1">Demo Construction Company</div>
              </div>
              <div className="text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center text-sm text-gray-300">
              <svg className="w-4 h-4 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Full dashboard access
            </div>
            <div className="flex items-center text-sm text-gray-300">
              <svg className="w-4 h-4 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Job & contact management
            </div>
            <div className="flex items-center text-sm text-gray-300">
              <svg className="w-4 h-4 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Document & task access
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-600/30">
            <button 
              onClick={() => router.push('/auth')}
              className="text-orange-400 hover:text-orange-300 text-sm transition-colors"
            >
              Need manual login? Click here
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">
            Demo environment • Secure admin access • PulseCRM v2.0
          </p>
        </div>
      </div>
    </div>
  );
}