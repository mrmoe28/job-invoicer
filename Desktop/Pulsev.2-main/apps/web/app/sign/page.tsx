'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SignaturePad } from '@/components/documents/SignaturePad';
import { useNotifications } from '@/components/providers/NotificationProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface SigningSession {
  id: string;
  documentId: string;
  documentTitle: string;
  signerName: string;
  signerEmail: string;
  signerRole?: string;
  status: 'pending' | 'signed' | 'expired' | 'declined';
  expiresAt: string;
}

export default function SignPage() {
  const searchParams = useSearchParams();
  const { success, error } = useNotifications();
  const [session, setSession] = useState<SigningSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signatureCompleted, setSignatureCompleted] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Simulate API call to validate token and load signing session
    setTimeout(() => {
      // Mock signing session data
      setSession({
        id: '1',
        documentId: 'doc_123',
        documentTitle: 'Solar Installation Contract - Johnson Residence',
        signerName: 'Sarah Johnson',
        signerEmail: 'sarah.johnson@email.com',
        signerRole: 'Property Owner',
        status: 'pending',
        expiresAt: '2024-12-31T23:59:59Z'
      });
      setIsLoading(false);
    }, 1000);
  }, [token]);

  const handleSignature = async (signatureData: string, type: 'draw' | 'type' | 'upload') => {
    try {
      // Simulate API call to save signature
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      success('Document signed successfully!');
      setSignatureCompleted(true);
      setShowSignaturePad(false);
      
      // Update session status
      if (session) {
        setSession({
          ...session,
          status: 'signed'
        });
      }
    } catch (err) {
      error('Failed to save signature. Please try again.');
    }
  };

  const handleDecline = () => {
    if (session) {
      setSession({
        ...session,
        status: 'declined'
      });
    }
    success('Document signing declined.');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading signing session...</p>
        </div>
      </div>
    );
  }

  if (!token || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Invalid Signing Link</CardTitle>
            <CardDescription>
              This signing link is invalid or has expired. Please contact the sender for a new link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard" className="w-full">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session.status === 'expired') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle>Signing Session Expired</CardTitle>
            <CardDescription>
              This signing session has expired. Please contact the sender for a new signing link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard" className="w-full">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session.status === 'signed' || signatureCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle>Document Signed Successfully!</CardTitle>
            <CardDescription>
              Thank you for signing "{session.documentTitle}". You will receive a copy via email shortly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Signed by:</strong> {session.signerName}<br />
                <strong>Email:</strong> {session.signerEmail}<br />
                <strong>Date:</strong> {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <Link href="/dashboard" className="w-full">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session.status === 'declined') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Document Signing Declined</CardTitle>
            <CardDescription>
              You have declined to sign "{session.documentTitle}". The sender has been notified.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard" className="w-full">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showSignaturePad) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <SignaturePad
            onSignature={handleSignature}
            onCancel={() => setShowSignaturePad(false)}
            signerInfo={{
              name: session.signerName,
              email: session.signerEmail,
              role: session.signerRole
            }}
            documentTitle={session.documentTitle}
          />
        </div>
      </div>
    );
  }

  // Document review page
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-6 w-6 mr-2" />
              Document Ready for Signature
            </CardTitle>
            <CardDescription>
              Please review the document below and proceed with signing when ready.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Document Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Document Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Document Title</p>
                <p className="text-sm text-gray-600">{session.documentTitle}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Signer</p>
                <p className="text-sm text-gray-600">{session.signerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-600">{session.signerEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Expires</p>
                <p className="text-sm text-gray-600">
                  {new Date(session.expiresAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Preview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Document Preview</CardTitle>
            <CardDescription>
              Review the document content before signing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Document Preview</p>
                <p className="text-sm text-gray-400">
                  {session.documentTitle}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  In production, this would show the actual PDF document
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={handleDecline}
                className="flex items-center"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Decline to Sign
              </Button>
              <Button
                onClick={() => setShowSignaturePad(true)}
                size="lg"
                className="flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Proceed to Sign
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-4">
              By proceeding to sign, you acknowledge that you have reviewed and agree to the terms of this document.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
