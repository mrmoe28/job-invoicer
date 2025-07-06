'use client';

import React, { useState } from 'react';
import { FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import SignatureField from './signature/SignatureField';
import { useToast } from './Toast';

interface DocumentSignerProps {
  document: {
    id: string;
    name: string;
    url: string;
    type: string;
  };
  onClose: () => void;
  onSign?: (documentId: string, signatures: SignatureData[]) => void;
}

interface SignatureData {
  field: string;
  signature: string;
  signedBy: string;
  signedAt: string;
}

export default function DocumentSigner({ document, onClose, onSign }: DocumentSignerProps) {
  const { addToast } = useToast();
  const [signatures, setSignatures] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Example signature fields - in production, these would come from document metadata
  const signatureFields = [
    { id: 'contractor', label: 'Contractor Signature', required: true },
    { id: 'client', label: 'Client Signature', required: true },
    { id: 'witness', label: 'Witness Signature (Optional)', required: false }
  ];

  const handleSignature = (fieldId: string, signature: string) => {
    setSignatures(prev => ({
      ...prev,
      [fieldId]: signature
    }));
  };

  const handleSubmit = async () => {
    // Check if all required signatures are provided
    const missingRequired = signatureFields
      .filter(field => field.required && !signatures[field.id])
      .map(field => field.label);

    if (missingRequired.length > 0) {
      addToast(`Please provide: ${missingRequired.join(', ')}`, 'error');
      return;
    }

    setIsSaving(true);

    try {
      // Prepare signature data
      const signatureData: SignatureData[] = Object.entries(signatures).map(([fieldId, signature]) => ({
        field: fieldId,
        signature,
        signedBy: 'Current User', // Get from auth context
        signedAt: new Date().toISOString()
      }));

      // In production, save to database
      if (onSign) {
        onSign(document.id, signatureData);
      }

      addToast('Document signed successfully!', 'success');
      setTimeout(onClose, 1500);
    } catch (error) {
      addToast('Failed to save signatures', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const downloadSignedDocument = () => {
    // In production, this would generate a PDF with embedded signatures
    addToast('Downloading signed document...', 'info');
    window.open(document.url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex">
      {/* Document Preview */}
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-white">{document.name}</h3>
          </div>
          <button
            onClick={downloadSignedDocument}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 bg-gray-800 p-4">
          <iframe
            src={document.url}
            className="w-full h-full bg-white rounded"
            title={document.name}
          />
        </div>
      </div>

      {/* Signature Panel */}
      <div className="w-96 bg-gray-900 border-l border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-1">Sign Document</h3>
          <p className="text-sm text-gray-400">
            Add your signature to the required fields below
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {signatureFields.map(field => (
            <SignatureField
              key={field.id}
              label={field.label}
              required={field.required}
              onSign={(signature) => handleSignature(field.id, signature)}
            />
          ))}

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">Legal Notice</p>
                <p className="text-xs">
                  By signing this document, you agree to the terms and conditions outlined within.
                  This electronic signature is legally binding.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 space-y-3">
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              isSaving
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Submit Signatures
              </>
            )}
          </button>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
