'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Icons, LoadingIcon } from '../ui/icons';
import { useAuth } from '../../lib/hooks/useAuth';
import { isValidEmail } from '../../lib/utils/index';

export function LoginForm() {
    const router = useRouter();
    const { login, isLoggingIn } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await login({
            email: formData.email,
            password: formData.password,
        });

        if (result.success) {
            router.push('/dashboard');
        } else {
            setErrors({ general: result.error || 'Login failed' });
        }
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear field-specific error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full space-y-8">
                {/* Logo */}
                <div className="text-center">
                    <div className="flex items-center justify-center mb-8">
                        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mr-3">
                            <span className="text-white font-bold text-xl">P</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Pulse<span className="text-orange-500">CRM</span>
                        </h1>
                    </div>
                    <h2 className="text-xl text-gray-700 dark:text-gray-300 mb-2">Welcome back</h2>
                    <p className="text-gray-500 dark:text-gray-400">Sign in to your crew workspace</p>
                </div>

                {/* Login Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center">Sign in to your account</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Email Address
                                    </label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder="Enter your email address"
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Password
                                    </label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        placeholder="Enter your password"
                                        className={errors.password ? 'border-red-500' : ''}
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                                    )}
                                </div>
                            </div>

                            {errors.general && (
                                <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                                    <div className="flex items-center">
                                        <Icons.AlertCircle size={16} className="mr-2" />
                                        {errors.general}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        type="checkbox"
                                        checked={formData.rememberMe}
                                        onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                                        className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        Remember me
                                    </label>
                                </div>
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-sm text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoggingIn}
                                className="w-full"
                            >
                                {isLoggingIn ? (
                                    <>
                                        <LoadingIcon className="mr-2 h-4 w-4" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        <Icons.LogOut size={16} className="mr-2" />
                                        Sign in
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Signup Link */}
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        Don&apos;t have an account?{' '}
                        <Link
                            href="/auth/signup"
                            className="text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300 font-semibold"
                        >
                            Create your workspace
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
} 