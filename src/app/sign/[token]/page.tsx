'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';
import SignatureCanvas from '@/components/signature/SignatureCanvas';

const SignaturePlacement = dynamic(() => import('@/components/signature/SignaturePlacement'), {
  ssr: false,
  loading: () => <div className="p-8 text-center">Loading...</div>
});

interface SigningSession {
  document: {
    id: string;
    name: string;
    fileUrl: string;
  };
  signer: {
    id: string;
    name: string;
    email: string;
    status: string;
  };
}

export default function SigningPage() {
  const params = useParams();
  const token = params.token as string;

  const [session, setSession] = useState<SigningSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [showPlacement, setShowPlacement] = useState(false);
  const [currentSignature, setCurrentSignature] = useState<string>('');
  const [signed, setSigned] = useState(false);

  const fetchSigningSession = useCallback(async () => {
    try {
      const response = await fetch(`/api/sign/${token}`);
      if (response.ok) {
        const data = await response.json();
        setSession(data);
        setSigned(data.signer.status === 'signed');
      } else {
        setError('Invalid or expired signing link');
      }
    } catch (error) {
      console.error('Error fetching signing session:', error);
      setError('Failed to load signing session');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSigningSession();
  }, [token, fetchSigningSession]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600">{error || 'Failed to load signing session'}</p>
        </div>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Already Signed</h1>
          <p className="text-gray-600">
            You have already signed this document. Thank you!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign Document</h1>
            <p className="text-gray-600">
              Hello {session.signer.name}, you&apos;ve been requested to sign the following document:
            </p>
          </div>

          <div className="border rounded-lg p-6 mb-8 bg-gray-50">
            <h2 className="text-xl font-semibold mb-2">{session.document.name}</h2>
            <p className="text-gray-600">Please review and sign this document.</p>
          </div>

          {!showSignature && !showPlacement && (
            <div className="text-center">
              <button
                onClick={() => setShowSignature(true)}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-medium"
              >
                Sign Document
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Signature Canvas Modal */}
      {showSignature && (
        <SignatureCanvas
          onSave={(signature) => {
            setCurrentSignature(signature);
            setShowSignature(false);
            setShowPlacement(true);
          }}
          onClose={() => setShowSignature(false)}
        />
      )}

      {/* Signature Placement Modal */}
      {showPlacement && session && (
        <SignaturePlacement
          documentName={session.document.name}
          documentUrl={session.document.fileUrl}
          signatureData={currentSignature}
          onConfirm={async (position) => {
            try {
              const response = await fetch(`/api/sign/${token}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  signatureData: currentSignature,
                  position
                }),
              });

              if (response.ok) {
                setSigned(true);
                setShowPlacement(false);
              } else {
                alert('Failed to save signature. Please try again.');
              }
            } catch (error) {
              console.error('Error saving signature:', error);
              alert('Failed to save signature. Please try again.');
            }
          }}
          onCancel={() => {
            setShowPlacement(false);
            setShowSignature(true);
          }}
        />
      )}
    </div>
  );
}
