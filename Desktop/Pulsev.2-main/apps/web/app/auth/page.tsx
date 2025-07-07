'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Icons, LoadingIcon } from '../../components/ui/icons';
import { Input } from '../../components/ui/input';

// --- Utility Functions ---
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setSession(user: any) {
  localStorage.setItem('pulse_user', JSON.stringify(user));
  localStorage.setItem('pulse_session_active', 'true');
  document.cookie = `pulse_session_active=true; path=/; max-age=2592000`;
  document.cookie = `pulse_user=${JSON.stringify(user)}; path=/; max-age=2592000`;
}

function clearSession() {
  localStorage.removeItem('pulse_user');
  localStorage.removeItem('pulse_session_active');
  document.cookie = 'pulse_user=; Max-Age=0; path=/;';
  document.cookie = 'pulse_session_active=; Max-Age=0; path=/;';
}

function clearSessionAndReload() {
  clearSession();
  window.location.reload();
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check session and registration message
  useEffect(() => {
    const userData = localStorage.getItem('pulse_user');
    const sessionActive = localStorage.getItem('pulse_session_active');
    const sessionCookie = getCookie('pulse_session_active');
    const userCookie = getCookie('pulse_user');
    if ((userData && sessionActive === 'true') || (sessionCookie === 'true' && userCookie)) {
      console.log('User already logged in, redirecting to dashboard');
      router.replace('/dashboard');
      return;
    }
    const message = searchParams.get('message');
    if (message === 'registration-success') {
      setSuccessMessage('Account created successfully! Please sign in with your new credentials.');
    }
  }, [searchParams, router]);

  // Handle login submit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/simple-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      console.log('Login API response:', data);
      if (response.ok && data.success && data.user && data.user.id && data.user.email) {
        setSession(data.user);
        console.log('Redirecting to dashboard...');
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Login failed. Please try again.');
        console.error('Login failed, API response:', data);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, password]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center justify-center w-12 h-12 mr-3 bg-orange-500 rounded-xl">
              <span className="text-xl font-bold text-white">P</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Pulse<span className="text-orange-500">CRM</span>
            </h1>
          </div>
          <h2 className="mb-2 text-xl text-gray-700 dark:text-gray-300">Welcome back</h2>
          <p className="text-gray-500 dark:text-gray-400">Sign in to your workspace</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="px-4 py-3 text-sm text-green-700 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/50 dark:border-green-800 dark:text-green-300">
            <div className="flex items-center">
              <Icons.Check size={16} className="mr-2" />
              {successMessage}
            </div>
          </div>
        )}

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Sign in to PulseCRM</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="px-4 py-3 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/50 dark:border-red-800 dark:text-red-300">
                  <div className="flex items-center">
                    <Icons.AlertCircle size={16} className="mr-2" />
                    {error}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    Remember me
                  </label>
                </div>
                <Link href="/auth/forgot-password" className="text-sm text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <LoadingIcon className="w-4 h-4 mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Icons.User size={16} className="mr-2" />
                    Sign in
                  </>
                )}
              </Button>
            </form>
            {/* Reset Session Button */}
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-xs text-gray-400 underline hover:text-orange-500"
                onClick={clearSessionAndReload}
              >
                Reset Session (Clear Login State)
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Signup Link */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="font-semibold text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300">
              Create your workspace
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-8 h-8 border-b-2 border-orange-500 rounded-full animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
