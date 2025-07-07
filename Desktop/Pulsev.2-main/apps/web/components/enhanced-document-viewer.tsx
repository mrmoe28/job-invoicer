'use client';

import React, { useState, useCallback } from 'react';
import { FileText, Download, Check, Users, Share2 } from 'lucide-react';
import UniversalDocumentViewer from './pdf/universal-document-viewer';
import DocumentSignature from './document-signature';

interface EnhancedDocumentViewerProps {
  document: {
    id: string;
    name: string;
    url: string;
    status?: string;
  };
  onClose?: () => void;
  className?: string;
  height?: string;
}

export default function EnhancedDocumentViewer({
  document,
  onClose,
  className,
  height = '800px',
}: EnhancedDocumentViewerProps) {
  const [showSignatureFlow, setShowSignatureFlow] = useState(false);
  const [showShareForm, setShowShareForm] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [signingComplete, setSigningComplete] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleSignDocument = useCallback(() => {
    setShowSignatureFlow(true);
  }, []);

  const handleShareDocument = useCallback(() => {
    setShowShareForm(true);
  }, []);

  const handleSignatureComplete = useCallback(() => {
    setShowSignatureFlow(false);
    setSigningComplete(true);
  }, []);

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipientEmail) {
      alert('Please enter a recipient email address');
      return;
    }
    
    try {
      // Call API to send signature request
      const response = await fetch('/api/documents/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: document.id,
          recipientEmail,
          recipientName,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to share document');
      }
      
      setShareSuccess(true);
      // Reset form after short delay
      setTimeout(() => {
        setShowShareForm(false);
        setShareSuccess(false);
        setRecipientEmail('');
        setRecipientName('');
      }, 3000);
    } catch (error) {
      console.error('Error sharing document:', error);
      alert('Failed to share document for signature. Please try again.');
    }
  };

  const downloadDocument = useCallback(async () => {
    try {
      // For signed documents, get the signed version
      let downloadUrl = document.url;
      
      if (signingComplete) {
        downloadUrl = `/api/documents/${document.id}/download-signed`;
      }
      
      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = document.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    }
  }, [document, signingComplete]);

  return (
    <div className={`bg-gray-900 rounded-lg overflow-hidden ${className}`} style={{ height }}>
      {/* Document Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-orange-500" />
          <div>
            <h3 className="font-medium text-white">{document.name}</h3>
            <p className="text-sm text-gray-400">
              {signingComplete ? (
                <span className="flex items-center text-green-400">
                  <Check className="w-3 h-3 mr-1" />
                  Signed Document
                </span>
              ) : (
                'PDF Document'
              )}
            </p>
          </div>
        </div>

        {/* Document Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSignDocument}
            className="px-3 py-2 text-sm text-white bg-orange-500 hover:bg-orange-600 rounded-md flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            Sign Document
          </button>
          
          <button
            onClick={handleShareDocument}
            className="px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-1"
          >
            <Share2 className="w-4 h-4" />
            Request Signature
          </button>
          
          <button
            onClick={downloadDocument}
            className="p-2 text-white bg-gray-700 hover:bg-gray-600 rounded-md"
            title="Download Document"
          >
            <Download className="w-4 h-4" />
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-gray-700 rounded-md"
              title="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Document Content */}
      <div className="w-full h-full" style={{ height: 'calc(100% - 69px)' }}>
        <UniversalDocumentViewer
          fileUrl={document.url}
          fileName={document.name}
          height="100%"
        />
      </div>

      {/* Signature Flow Modal */}
      {showSignatureFlow && (
        <DocumentSignature
          documentId={document.id}
          documentUrl={document.url}
          documentName={document.name}
          onComplete={handleSignatureComplete}
          onCancel={() => setShowSignatureFlow(false)}
        />
      )}

      {/* Share Form Modal */}
      {showShareForm && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Request Signature
              </h3>
              <button
                onClick={() => setShowShareForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {shareSuccess ? (
              <div className="text-center py-4">
                <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Signature Request Sent!</h4>
                <p className="text-gray-600">
                  A signature request has been sent to {recipientEmail}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleShareSubmit}>
                <div className="mb-4">
                  <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient Email*
                  </label>
                  <input
                    type="email"
                    id="recipientEmail"
                    value={recipientEmail}
                    onChange={e => setRecipientEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    id="recipientName"
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Send Signature Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowShareForm(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
