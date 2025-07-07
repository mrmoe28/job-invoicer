'use client';

import React, { useState } from 'react';
import { Check, FileText, Download, ArrowLeft } from 'lucide-react';
import DocumentSignature from '@/components/document-signature';
import Link from 'next/link';

interface SignDocumentViewProps {
  document: {
    id: string;
    name: string;
    path: string;
    url?: string;
  };
  signature: {
    id: string;
    signerEmail: string;
    signerName: string;
    status: string;
  };
}

export default function SignDocumentView({ document, signature }: SignDocumentViewProps) {
  const [signingComplete, setSigningComplete] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Generate a URL for the document if not provided
  const documentUrl = document.url || `/api/files/${document.path.split('/').pop()}`;
  
  const handleSigningComplete = async () => {
    setSigningComplete(true);
  };

  const handleDownloadSignedDocument = async () => {
    try {
      setDownloading(true);
      const response = await fetch(`/api/documents/${document.id}/download-signed`);
      if (!response.ok) {
        throw new Error('Failed to download signed document');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `signed-${document.name}`;
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

  if (signingComplete) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="p-6 sm:p-10 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Document Signed Successfully!
              </h1>
              
              <p className="text-gray-600 mb-8">
                Thank you for signing <strong>{document.name}</strong>. Your signature has been recorded.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={handleDownloadSignedDocument}
                  disabled={downloading}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
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
                      Download Signed Document
                    </>
                  )}
                </button>
                
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Return to Homepage
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <FileText className="h-8 w-8 text-orange-500 mr-3" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Sign Document</h1>
            <p className="text-sm text-gray-600">{document.name}</p>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-6">
            <p className="text-lg mb-6">
              Hello <strong>{signature.signerName || signature.signerEmail}</strong>, please review and sign the document below.
            </p>
            
            <div className="border border-gray-200 rounded-lg h-[700px]">
              <DocumentSignature
                documentId={document.id}
                documentUrl={documentUrl}
                documentName={document.name}
                signatureId={signature.id}
                recipientEmail={signature.signerEmail}
                recipientName={signature.signerName}
                onComplete={handleSigningComplete}
                onCancel={() => window.location.href = '/'}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
