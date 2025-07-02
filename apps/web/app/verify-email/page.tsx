'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyEmailRedirectContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Get the token from the URL
        const token = searchParams.get('token');

        // Redirect to the correct verification page
        if (token) {
            router.replace(`/auth/verify?token=${token}`);
        } else {
            router.replace('/auth/verify');
        }
    }, [router, searchParams]);

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-300">Redirecting to verification page...</p>
            </div>
        </div>
    );
}

export default function VerifyEmailRedirect() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading...</p>
                </div>
            </div>
        }>
            <VerifyEmailRedirectContent />
        </Suspense>
    );
} 