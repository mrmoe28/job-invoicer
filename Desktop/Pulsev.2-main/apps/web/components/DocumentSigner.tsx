"use client";
import { findSignatureFields } from '../lib/pdf/findSignatureFields';

import React, { useState, useEffect, useRef } from 'react';
import { FileText, CheckCircle, AlertCircle, Download, X, Type, Upload, Move, UserPlus, Send, Mail } from 'lucide-react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { useToast } from './Toast';
import { SignaturePicker, SignatureOverlay } from './signature';

interface DocumentSignerProps {
  document: {
    id: string;
    name: string;
    url: string;
    type: string;
    file?: File;
  };
  onCloseAction: () => void;
  onSign?: (documentId: string, signatures: SignatureData[]) => void;
}

interface SignatureData {
  userId: string;
  imageUrl: string;
  page: number;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  signedAt: string;
  name?: string;
  email?: string;
}

interface PlacedSignature {
  id: string;
  imageUrl: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Recipient {
  email: string;
  name: string;
  type: 'signer' | 'cc' | 'bcc';
}

export default function DocumentSigner({ document: pdfDocument, onCloseAction, onSign }: DocumentSignerProps) {
  const { addToast } = useToast();
  const [showSignaturePicker, setShowSignaturePicker] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [placedSignatures, setPlacedSignatures] = useState<PlacedSignature[]>([]);
  const [signatureHighlights, setSignatureHighlights] = useState<Array<{ page: number, x: number, y: number, width: number, height: number }>>([]);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [selectedSignatureId, setSelectedSignatureId] = useState<string | null>(null);
  const [showEmailOptions, setShowEmailOptions] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [emailSubject, setEmailSubject] = useState<string>(`Signed Document: ${pdfDocument.name}`);
  const [emailBody, setEmailBody] = useState<string>('');

  // Reference to PDF container for positioning
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Scan PDF for 'Signature' fields and highlight them
  useEffect(() => {
    if (!pdfUrl) return;
    (async () => {
      try {
        const highlights = await findSignatureFields(pdfUrl);
        setSignatureHighlights(highlights);
      } catch (err) {
        // Optionally handle error
      }
    })();
  }, [pdfUrl]);

  // Load saved signatures from localStorage
  useEffect(() => {
    const savedSignatures = localStorage.getItem(`signatures_${pdfDocument.id}`);
    if (savedSignatures) {
      try {
        setPlacedSignatures(JSON.parse(savedSignatures));
      } catch (e) {
        console.error('Error loading saved signatures:', e);
      }
    }
  }, [pdfDocument.id]);

  // Handle PDF URL - create blob URL if file is provided
  useEffect(() => {
    if (pdfDocument.file) {
      const url = URL.createObjectURL(pdfDocument.file);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPdfUrl(pdfDocument.url);
    }
  }, [pdfDocument.file, pdfDocument.url]);

  const handleSignatureSave = (sigDataUrl: string) => {
    setSignatureImage(sigDataUrl);
    setShowSignaturePicker(false);
    
    // Automatically add signature to current page
    addSignatureToPage(sigDataUrl);
  };

  const addSignatureToPage = (imageUrl: string = signatureImage!) => {
    if (!imageUrl) {
      addToast('Please create or upload a signature first', 'error');
      return;
    }

    const newSignature: PlacedSignature = {
      id: Date.now().toString(),
      imageUrl,
      page: currentPage,
      x: 100,
      y: 100,
      width: 200,
      height: 75
    };

    const updatedSignatures = [...placedSignatures, newSignature];
    setPlacedSignatures(updatedSignatures);
    setSelectedSignatureId(newSignature.id);
    
    // Save to localStorage
    localStorage.setItem(`signatures_${pdfDocument.id}`, JSON.stringify(updatedSignatures));
    addToast('Signature added! You can drag it to position.', 'success');
  };

  const updateSignaturePosition = (id: string, x: number, y: number, width: number, height: number) => {
    const updated = placedSignatures.map(sig => 
      sig.id === id ? { ...sig, x, y, width, height } : sig
    );
    setPlacedSignatures(updated);
    localStorage.setItem(`signatures_${pdfDocument.id}`, JSON.stringify(updated));
  };

  const removeSignature = (id: string) => {
    const updated = placedSignatures.filter(sig => sig.id !== id);
    setPlacedSignatures(updated);
    setSelectedSignatureId(null);
    localStorage.setItem(`signatures_${pdfDocument.id}`, JSON.stringify(updated));
  };

  const addRecipient = () => {
    setRecipients([...recipients, { 
      email: '', 
      name: '', 
      type: 'signer' 
    }]);
  };

  const updateRecipient = (index: number, field: keyof Recipient, value: string) => {
    const updated = [...recipients];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setRecipients(updated);
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (placedSignatures.length === 0) {
      addToast('Please add at least one signature', 'error');
      return;
    }

    setIsSaving(true);

    try {
      // Convert placed signatures to SignatureData format
      const signatureData: SignatureData[] = placedSignatures.map(sig => {
        // Get container dimensions
        const container = pdfContainerRef.current?.getBoundingClientRect();
        const page = document.querySelector(`.rpv-core__page:nth-child(${sig.page})`)?.getBoundingClientRect();
        
        // Calculate percentages
        const xPercent = container && page ? (sig.x / page.width) * 100 : 20;
        const yPercent = container && page ? (sig.y / page.height) * 100 : 70;
        const widthPercent = container && page ? (sig.width / page.width) * 100 : 25;
        
        return {
          userId: 'current-user',
          imageUrl: sig.imageUrl,
          page: sig.page,
          xPercent,
          yPercent,
          widthPercent,
          signedAt: new Date().toISOString(),
          name: recipients.length > 0 ? recipients[0].name : undefined,
          email: recipients.length > 0 ? recipients[0].email : undefined
        };
      });

      // Send to API
      const formData = new FormData();
      if (pdfDocument.file) {
        formData.append('pdf', pdfDocument.file);
      } else {
        try {
          const response = await fetch(pdfDocument.url);
          const blob = await response.blob();
          formData.append('pdf', blob, pdfDocument.name);
        } catch (error) {
          console.error('Error fetching PDF:', error);
          addToast('Error loading PDF file', 'error');
          setIsSaving(false);
          return;
        }
      }
      
      formData.append('signatures', JSON.stringify(signatureData));
      formData.append('documentName', pdfDocument.name);
      
      // Add email options if provided
      if (recipients.length > 0) {
        formData.append('recipients', JSON.stringify(recipients));
      }
      
      if (emailSubject.trim()) {
        formData.append('emailSubject', emailSubject);
      }
      
      if (emailBody.trim()) {
        formData.append('emailBody', emailBody);
      }

      const apiResponse = await fetch('/api/send-signed-pdf', {
        method: 'POST',
        body: formData
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || 'Failed to send signed document');
      }

      const result = await apiResponse.json();
      
      if (onSign) {
        onSign(pdfDocument.id, signatureData);
      }

      // Clear saved signatures
      localStorage.removeItem(`signatures_${pdfDocument.id}`);

      addToast('Document signed and sent successfully!', 'success');
      setTimeout(onCloseAction, 1500);
    } catch (error) {
      console.error('Error submitting signatures:', error);
      addToast(`Failed to save signatures: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex">
      {/* Document Preview */}
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-white">{pdfDocument.name}</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Page {currentPage} of {numPages || '...'}</span>
            </div>
            <button
              onClick={() => window.open(pdfUrl, '_blank')}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
              title="Open in new tab"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div 
          className="flex-1 bg-gray-800 p-4 overflow-auto relative"
          onClick={() => setSelectedSignatureId(null)}
        >
          <div
            ref={pdfContainerRef}
            className="relative mx-auto bg-white rounded-lg shadow-lg"
            style={{ width: '100%', maxWidth: '800px', minHeight: '600px' }}
          >
            {/* PDF Viewer */}
            <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
              <div style={{ height: '100%', minHeight: '600px' }}>
                <Viewer 
                  fileUrl={pdfUrl}
                  onDocumentLoad={(e) => setNumPages(e.doc.numPages)}
                  onPageChange={(e) => setCurrentPage(e.currentPage)}
                />
              </div>
            </Worker>
            
            {/* Signature Field Highlights */}
            {signatureHighlights
              .filter(h => h.page === currentPage)
              .map((h, idx) => (
                <div
                  key={`highlight-${idx}`}
                  className="absolute border-2 border-yellow-400 bg-yellow-200 bg-opacity-30 pointer-events-none animate-pulse"
                  style={{
                    left: h.x,
                    top: h.y,
                    width: h.width,
                    height: h.height,
                    zIndex: 5,
                  }}
                />
              ))}
              
            {/* Signature Overlays */}
            {placedSignatures
              .filter(sig => sig.page === currentPage)
              .map(signature => (
                <SignatureOverlay
                  key={signature.id}
                  id={signature.id}
                  imageUrl={signature.imageUrl}
                  initialPosition={{
                    x: signature.x,
                    y: signature.y,
                    width: signature.width,
                    height: signature.height
                  }}
                  containerRef={pdfContainerRef}
                  onPositionChange={(id, x, y, width, height) => 
                    updateSignaturePosition(id, x, y, width, height)
                  }
                  onRemove={removeSignature}
                  isSelected={selectedSignatureId === signature.id}
                  onSelect={(id) => setSelectedSignatureId(id)}
                />
              ))}
          </div>
        </div>
      </div>

      {/* Signature Panel */}
      <div className="w-96 bg-gray-900 border-l border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-1">Sign Document</h3>
          <p className="text-sm text-gray-400">
            Create your signature and place it on the document
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Add Signature Button */}
          <button
            onClick={() => setShowSignaturePicker(true)}
            className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
          >
            <Type className="w-4 h-4" />
            {signatureImage ? 'Change Signature' : 'Add Signature'}
          </button>
          
          {/* Email Options Toggle */}
          <button
            onClick={() => setShowEmailOptions(!showEmailOptions)}
            className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              showEmailOptions 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Mail className="w-4 h-4" />
            {showEmailOptions ? 'Hide Email Options' : 'Email Options'}
          </button>

          {/* Email Options */}
          {showEmailOptions && (
            <div className="space-y-4 bg-gray-800 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Body (Optional)
                </label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Enter email body text..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  rows={4}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Recipients
                  </label>
                  <button
                    onClick={addRecipient}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <UserPlus className="w-3 h-3" />
                    Add
                  </button>
                </div>
                
                {recipients.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center bg-gray-700 p-3 rounded-lg">
                    No recipients added. Document will be sent to default recipients.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recipients.map((recipient, index) => (
                      <div key={index} className="bg-gray-700 p-3 rounded-lg space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <input
                              type="email"
                              value={recipient.email}
                              onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                              placeholder="Email"
                              className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 text-sm focus:outline-none focus:border-orange-500"
                            />
                          </div>
                          <select
                            value={recipient.type}
                            onChange={(e) => updateRecipient(index, 'type', e.target.value as 'signer' | 'cc' | 'bcc')}
                            className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:border-orange-500"
                          >
                            <option value="signer">To</option>
                            <option value="cc">CC</option>
                            <option value="bcc">BCC</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={recipient.name}
                            onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                            placeholder="Name (optional)"
                            className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 text-sm focus:outline-none focus:border-orange-500"
                          />
                          
                          <button
                            onClick={() => removeRecipient(index)}
                            className="ml-2 p-1 text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Placed Signatures Summary */}
          {placedSignatures.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Placed Signatures ({placedSignatures.length})
              </h4>
              <div className="space-y-1 text-xs text-gray-400">
                {placedSignatures.map((sig, index) => (
                  <div key={sig.id} className="flex justify-between">
                    <span>Signature {index + 1} - Page {sig.page}</span>
                    <button
                      onClick={() => {
                        setCurrentPage(sig.page);
                        setSelectedSignatureId(sig.id);
                      }}
                      className="text-orange-400 hover:text-orange-300"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">How to Sign</p>
                <p className="text-xs">
                  1. Click "Add Signature" to create your signature<br/>
                  2. Drag the signature to position it on the document<br/>
                  3. Resize as needed using the handle in the corner<br/>
                  4. Click "Submit" when ready
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 space-y-3">
          <button
            onClick={handleSubmit}
            disabled={isSaving || placedSignatures.length === 0}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              isSaving || placedSignatures.length === 0
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Submit Signed Document
              </>
            )}
          </button>
          
          <button
            onClick={onCloseAction}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Signature Picker Modal */}
      {showSignaturePicker && (
        <SignaturePicker 
          onSave={handleSignatureSave}
          onClose={() => setShowSignaturePicker(false)}
          documentName={pdfDocument.name}
        />
      )}
    </div>
  );
}