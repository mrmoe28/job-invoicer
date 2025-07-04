'use client';

import { useEffect, useState } from 'react';
import { useUser, useStackApp } from '@stackframe/stack';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface DebugInfo {
    timestamp?: string;
    currentUrl?: string;
    urlParams?: Record<string, string>;
    userStatus?: string;
    userInfo?: {
        id: string;
        email: string | null;
        displayName: string | null;
    } | null;
    stackAppAvailable?: boolean;
    environmentVars?: {
        projectId?: string;
        hasPublishableKey?: boolean;
        baseUrl?: string;
    };
}

export default function OAuthDebugPage() {
    const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
    const [error, setError] = useState('');
    const user = useUser();
    const stackApp = useStackApp();
    const searchParams = useSearchParams();

    useEffect(() => {
        const urlParams = Object.fromEntries(searchParams.entries());

        setDebugInfo({
            timestamp: new Date().toISOString(),
            currentUrl: window.location.href,
            urlParams,
            userStatus: user ? 'Authenticated' : 'Not authenticated',
            userInfo: user ? {
                id: user.id,
                email: user.primaryEmail,
                displayName: user.displayName,
            } : null,
            stackAppAvailable: !!stackApp,
            environmentVars: {
                projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
                hasPublishableKey: !!process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
                baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
            }
        });
    }, [user, stackApp, searchParams]);

    const testGoogleOAuth = async () => {
        try {
            setError('');
            console.log('Testing Google OAuth...');
            await stackApp.signInWithOAuth('google');
        } catch (err: unknown) {
            console.error('OAuth Test Error:', err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(`OAuth Test Failed: ${errorMessage}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">OAuth Debug Information</h1>

                    {/* User Status */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <h2 className="text-lg font-semibold text-blue-900 mb-2">Authentication Status</h2>
                        <div className="text-sm">
                            <p><strong>Status:</strong> {user ? '✅ Authenticated' : '❌ Not Authenticated'}</p>
                            {user && (
                                <>
                                    <p><strong>User ID:</strong> {user.id}</p>
                                    <p><strong>Email:</strong> {user.primaryEmail}</p>
                                    <p><strong>Display Name:</strong> {user.displayName}</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Environment Info */}
                    <div className="mb-6 p-4 bg-green-50 rounded-lg">
                        <h2 className="text-lg font-semibold text-green-900 mb-2">Environment Configuration</h2>
                        <div className="text-sm space-y-1">
                            <p><strong>Project ID:</strong> {debugInfo.environmentVars?.projectId || 'Not set'}</p>
                            <p><strong>Publishable Key:</strong> {debugInfo.environmentVars?.hasPublishableKey ? '✅ Set' : '❌ Not set'}</p>
                            <p><strong>Base URL:</strong> {debugInfo.environmentVars?.baseUrl || 'Not set'}</p>
                            <p><strong>Stack App:</strong> {debugInfo.stackAppAvailable ? '✅ Available' : '❌ Not available'}</p>
                        </div>
                    </div>

                    {/* URL Parameters */}
                    <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                        <h2 className="text-lg font-semibold text-yellow-900 mb-2">URL Parameters</h2>
                        <div className="text-sm">
                            <p><strong>Current URL:</strong> {debugInfo.currentUrl}</p>
                            {Object.keys(debugInfo.urlParams || {}).length > 0 ? (
                                <div className="mt-2">
                                    <strong>Parameters:</strong>
                                    <pre className="mt-1 p-2 bg-yellow-100 rounded text-xs overflow-auto">
                                        {JSON.stringify(debugInfo.urlParams, null, 2)}
                                    </pre>
                                </div>
                            ) : (
                                <p className="text-yellow-700">No URL parameters</p>
                            )}
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h2 className="text-lg font-semibold text-red-900 mb-2">Error Information</h2>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Test Buttons */}
                    <div className="mb-6 space-y-3">
                        <h2 className="text-lg font-semibold text-gray-900">Test OAuth</h2>
                        <button
                            onClick={testGoogleOAuth}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Test Google OAuth
                        </button>
                    </div>

                    {/* Debug Data */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Full Debug Data</h2>
                        <pre className="text-xs overflow-auto bg-gray-100 p-3 rounded">
                            {JSON.stringify(debugInfo, null, 2)}
                        </pre>
                    </div>

                    {/* Navigation */}
                    <div className="flex space-x-4">
                        <Link
                            href="/"
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Back to Home
                        </Link>
                        <Link
                            href="/login"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Go to Login
                        </Link>
                        <Link
                            href="/test-auth"
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Auth Test Page
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
} 