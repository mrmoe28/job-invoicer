'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Check, Download, Home } from 'lucide-react';
import Link from 'next/link';

export default function SigningCompletePage() {
  const searchParams = useSearchParams();
  const documentId = searchParams.get('documentId');
  const [documentName, setDocumentName] = useState('your document');
  const [downloading, setDownloading] = useState(false);
  
  // Fetch document details if available
  useEffect(() => {
    if (documentId) {
      const fetchDocumentDetails = async () => {
        try {
          const response = await fetch(`/api/documents/${documentId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.document && data.document.name) {
              setDocumentName(data.document.name);
            }
          }
        } catch (error) {
          console.error('Error fetching document details:', error);
        }
      };
      
      fetchDocumentDetails();
    }
  }, [documentId]);

  const handleDownloadSignedDocument = async () => {
    if (!documentId) return;
    
    try {
      setDownloading(true);
      const response = await fetch(`/api/documents/${documentId}/download-signed`);
      if (!response.ok) {
        throw new Error('Failed to download signed document');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `signed-${documentName}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Signing Complete!
        </h2>
        
        <p className="mt-2 text-center text-lg text-gray-600">
          Thank you for signing {documentName}. Your signature has been recorded successfully.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {documentId && (
                <button
                  onClick={handleDownloadSignedDocument}
                  disabled={downloading}
                  className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  {downloading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      Download Document
                    </>
                  )}
                </button>
              )}
              
              <Link
                href="/"
                className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <Home className="mr-2 h-5 w-5" />
                Return to Homepage
              </Link>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>
                A confirmation of this signature will be sent to all parties involved.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>This document has been electronically signed in accordance with applicable law.</p>
          <p className="mt-1">A secure record of this transaction has been recorded in our system.</p>
        </div>
      </div>
    </div>
  );
}
