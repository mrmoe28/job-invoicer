'use client';

import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function DebugPage() {
    const [debugInfo, setDebugInfo] = useState<any>({});

    useEffect(() => {
        const userData = localStorage.getItem('pulse_user');
        const sessionActive = localStorage.getItem('pulse_session_active');

        setDebugInfo({
            userData: userData ? JSON.parse(userData) : null,
            sessionActive,
            userDataRaw: userData,
            localStorageKeys: Object.keys(localStorage),
            timestamp: new Date().toISOString()
        });
    }, []);

    const clearStorage = () => {
        localStorage.removeItem('pulse_user');
        localStorage.removeItem('pulse_session_active');
        window.location.reload();
    };



    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Debug Information</h1>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Authentication State</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-auto">
                                {JSON.stringify(debugInfo, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button onClick={clearStorage} variant="outline">
                                Clear LocalStorage
                            </Button>
                            <Button onClick={() => window.location.href = '/auth'} variant="outline">
                                Go to Login
                            </Button>
                            <Button onClick={() => window.location.href = '/dashboard'} variant="outline">
                                Go to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 