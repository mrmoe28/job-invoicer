'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for admin2 fallback and pre-fill credentials
  useEffect(() => {
    const isAdmin2Fallback = searchParams.get('admin2');
    if (isAdmin2Fallback) {
      setEmail('admin2@pulsecrm.local');
      setPassword('admin456');
    }
  }, [searchParams]);

  // tRPC mutation hook
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

        router.push('/dashboard');
      }
    },
    onError: (error) => {
      setError(error.message || 'Something went wrong. Please try again.');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Simple demo login - accepts any email with admin123 password for demo purposes
    const isValidDemo = (
      (email === 'admin' && password === 'admin123') ||
      (email.includes('@') && password === 'admin123') ||
      (email === 'ekosolarize@gmail.com' && password === 'admin123') ||
      (email === 'admin2@pulsecrm.local' && password === 'admin456')
    );
    
    if (isValidDemo) {
      // Get existing user data to preserve settings and uploaded content
      const existingUserData = localStorage.getItem('pulse_user');
      let existingData = {};
      
      if (existingUserData) {
        try {
          existingData = JSON.parse(existingUserData);
        } catch (error) {
          console.error('Error parsing existing user data:', error);
        }
      }

      // Store user session with preserved data
      const userData = {
        id: '1',
        email: email.includes('@') ? email : 'admin@pulsecrm.com',
        name: email.includes('@') ? email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ') : 'Admin User',
        username: email.includes('@') ? email.split('@')[0] : 'admin',
        role: 'Administrator',
        organizationId: '1',
        organizationName: 'Demo Organization',
        organizationSlug: 'demo',
        plan: 'premium',
        loginTime: new Date().toISOString(),
        // Preserve existing profile image and other settings
        ...existingData,
        // Override essential fields but keep the actual email
        id: '1',
        email: email.includes('@') ? email : 'admin@pulsecrm.com',
        username: email.includes('@') ? email.split('@')[0] : 'admin',
        role: 'Administrator'
      };

      localStorage.setItem('pulse_user', JSON.stringify(userData));
      
      // Set session flag to indicate successful authentication
      localStorage.setItem('pulse_session_active', 'true');
      
      router.push('/dashboard');
    } else {
      setError('Invalid credentials. Use any email with password: admin123 for demo, or admin2@pulsecrm.local with password: admin456');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Pulse<span className="text-orange-500">CRM</span>
            </h1>
          </div>
          <h2 className="text-xl text-gray-300 mb-2">Welcome back</h2>
          <p className="text-gray-400">Sign in to your crew workspace</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-600 bg-gray-800 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 text-sm text-gray-300">
                Remember me
              </label>
            </div>
            <button type="button" className="text-sm text-orange-500 hover:text-orange-400">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {loginMutation.isPending ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Signup Link */}
        <div className="text-center">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-orange-500 hover:text-orange-400 font-semibold">
              Create your workspace
            </Link>
          </p>
          
          {/* Admin Access Link */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Admin Access:</p>
            <Link 
              href="/login/admin2" 
              className="inline-flex items-center text-orange-500 hover:text-orange-400 text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v-2H7v-2H4a1 1 0 01-1-1v-1m0 0V9a6 6 0 016-6h2a1 1 0 011 1v3m0 0v3a6 6 0 01-7.743 5.743L11 17H9v-2H7v-2H4a1 1 0 01-1-1v-1m0 0V9a6 6 0 016-6h2a1 1 0 011 1v3" />
              </svg>
              Direct Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
