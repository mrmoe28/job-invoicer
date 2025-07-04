'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function TestAuthPage() {
    const [envVars, setEnvVars] = useState({
        projectId: '',
        publishableKey: '',
        hasSecretKey: false,
    });

    useEffect(() => {
        // Check environment variables on client side
        setEnvVars({
            projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID || 'Not set',
            publishableKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || 'Not set',
            hasSecretKey: !!process.env.STACK_SECRET_SERVER_KEY,
        });
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Stack Auth Test</h1>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project ID
                        </label>
                        <div className="p-2 bg-gray-50 rounded border text-sm font-mono">
                            {envVars.projectId}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Publishable Key
                        </label>
                        <div className="p-2 bg-gray-50 rounded border text-sm font-mono">
                            {envVars.publishableKey}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Server Key Status
                        </label>
                        <div className="p-2 bg-gray-50 rounded border text-sm">
                            {envVars.hasSecretKey ? '✅ Set' : '❌ Not set'}
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-medium text-blue-900 mb-2">Expected Values:</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Project ID: e5361e77-f853-4684-97a7-461cf3187c3f</li>
                            <li>• Publishable Key: pck_73rc9h9ncgbcrxezvphz4ct4ksxbxgpldxm2eprpdxz1g</li>
                            <li>• Server Key: Should be set</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
} 