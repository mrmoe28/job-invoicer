'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  FileText, Save, X, ArrowLeft, 
  Download, Upload, Check, AlertCircle 
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard-layout';
import SignatureCanvas from '@/components/SignatureCanvas';
import { useToast } from '@/components/Toast';

interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  category: string;
  uploadDate: string;
  url: string;
  status: string;
}

export default function SignDocumentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docId = searchParams.get('id');
  
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  
  const { addToast, ToastContainer } = useToast();
  
  // Load document data
  useEffect(() => {
    if (!docId) {
      setError('No document ID provided');
      setLoading(false);
      return;
    }
    
    async function loadDocument() {
      try {
        setLoading(true);
        const response = await fetch('/api/docs');
        
        if (response.ok) {
          const data = await response.json();
          const doc = data.documents.find((d: Document) => d.id === docId);
          
          if (doc) {
            setDocument(doc);
          } else {
            setError('Document not found');
          }
        } else {
          setError('Failed to load document');
        }
      } catch (err) {
        console.error('Error loading document:', err);
        setError('An error occurred while loading the document');
      } finally {
        setLoading(false);
      }
    }
    
    loadDocument();
  }, [docId]);
  
  // Handle signature save
  const handleSignatureSave = (dataUrl: string) => {
    setSignatureDataUrl(dataUrl);
    setShowSignature(false);
  };
  
  // Handle document signing
  const handleSignDocument = async () => {
    if (!document || !signatureDataUrl) return;
    
    try {
      setSigning(true);
      
      // This is a simplified example - in a real app, you would:
      // 1. Convert the PDF to a canvas
      // 2. Draw the signature on the canvas
      // 3. Convert the canvas back to PDF
      // 4. Upload the signed PDF
      
      // For now, we'll just update the document status
      const response = await fetch(`/api/docs/${document.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'signed' }),
      });
      
      if (response.ok) {
        addToast('Document signed successfully', 'success');
        
        // Navigate back to documents page
        setTimeout(() => {
          router.push('/dashboard/documents');
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sign document');
      }
    } catch (err) {
      console.error('Error signing document:', err);
      addToast(
        err instanceof Error ? err.message : 'Failed to sign document',
        'error'
      );
    } finally {
      setSigning(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    router.push('/dashboard/documents');
  };
  
  if (loading) {
    return (
      <DashboardLayout title="Sign Document">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading document...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error) {
    return (
      <DashboardLayout title="Sign Document">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Error</h2>
            <p className="text-gray-400">{error}</p>
            <button
              onClick={handleCancel}
              className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Documents
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!document) {
    return (
      <DashboardLayout title="Sign Document">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Document Not Found</h2>
            <p className="text-gray-400">The requested document could not be found.</p>
            <button
              onClick={handleCancel}
              className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Documents
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout title={`Sign: ${document.name}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">Sign Document</h1>
          </div>
          
          <div className="flex gap-3">
            <a
              href={document.url}
              download={document.name}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          </div>
        </div>
        
        {/* Document Info */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-gray-400" />
            <h2 className="text-xl font-bold text-white">{document.name}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-gray-400 text-sm">Type</p>
              <p className="text-white">{document.type}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Size</p>
              <p className="text-white">{Math.round(document.size / 1024)} KB</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Date</p>
              <p className="text-white">{new Date(document.uploadDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        
        {/* Document Viewer */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="h-[60vh] bg-gray-900">
            <iframe 
              src={document.url} 
              className="w-full h-full"
              title={document.name}
            />
          </div>
        </div>
        
        {/* Signature Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {!signatureDataUrl ? (
            <button
              onClick={() => setShowSignature(true)}
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              Add Signature
            </button>
          ) : (
            <>
              <div className="bg-white rounded-lg p-3 border border-gray-300">
                <img 
                  src={signatureDataUrl} 
                  alt="Your signature" 
                  className="h-16" 
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSignature(true)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  Change
                </button>
                
                <button
                  onClick={handleSignDocument}
                  disabled={signing}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                >
                  {signing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Signing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Sign Document
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
        
        {/* Signature Canvas Modal */}
        {showSignature && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <SignatureCanvas
              onSave={handleSignatureSave}
              onCancel={() => setShowSignature(false)}
            />
          </div>
        )}
      </div>
      
      <ToastContainer />
    </DashboardLayout>
  );
}