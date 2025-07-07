'use client';

import { useSearchParams } from 'next/navigation';
import { XCircle, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SignDocumentErrorPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'unknown';

  // Define error messages based on reason
  const errorMessages = {
    missing_token: {
      title: 'Missing Signature Token',
      message: 'No signature token was provided. Please use the complete link from the email invitation.',
    },
    invalid_token: {
      title: 'Invalid Signature Token',
      message: 'The signature token is invalid or has been used already.',
    },
    expired_token: {
      title: 'Signature Request Expired',
      message: 'This signature request has expired. Please contact the sender for a new request.',
    },
    server_error: {
      title: 'Server Error',
      message: 'An unexpected error occurred. Please try again later or contact support.',
    },
    unknown: {
      title: 'Error Accessing Document',
      message: 'There was a problem accessing the document for signing. Please try again or contact support.',
    },
  };

  const error = errorMessages[reason as keyof typeof errorMessages] || errorMessages.unknown;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <XCircle className="h-16 w-16 text-red-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {error.title}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {error.message}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <div className="flex flex-col space-y-4">
            <Link
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <Home className="mr-2 h-5 w-5" />
              Return to Homepage
            </Link>
            <button
              onClick={() => window.history.back()}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Go Back
            </button>
          </div>

          <div className="mt-6">
            <p className="text-center text-xs text-gray-500">
              If you continue to experience issues, please contact the document sender
              or our support team for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
