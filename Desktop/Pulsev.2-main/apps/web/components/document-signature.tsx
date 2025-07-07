'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Download, Check, Pen, Trash } from 'lucide-react';

interface DocumentSignatureProps {
  documentId: string;
  documentUrl: string;
  documentName: string;
  signatureId?: string;
  recipientEmail?: string;
  recipientName?: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

const DocumentSignature: React.FC<DocumentSignatureProps> = ({
  documentId,
  documentUrl,
  documentName,
  signatureId,
  recipientEmail,
  recipientName,
  onComplete,
  onCancel,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signature, setSignature] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [positions, setPositions] = useState<{ x: number; y: number; page: number }[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [signingComplete, setSigningComplete] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signatureContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load document and signature positions
  useEffect(() => {
    const loadSignaturePositions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/documents/${documentId}/signature-positions${signatureId ? `?signatureId=${signatureId}` : ''}`);
        if (!response.ok) {
          throw new Error('Failed to load signature positions');
        }
        const data = await response.json();
        setPositions(data.positions || []);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load document');
        setLoading(false);
      }
    };

    loadSignaturePositions();
  }, [documentId, signatureId]);

  // Initialize signature drawing canvas
  useEffect(() => {
    if (drawingMode && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.strokeStyle = '#0066cc';
        context.lineWidth = 3;
        context.lineCap = 'round';
      }
    }
  }, [drawingMode]);

  // Handle signature drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.closePath();
    setIsDrawing(false);
    
    // Save signature
    const signatureDataUrl = canvas.toDataURL('image/png');
    setSignature(signatureDataUrl);
  };

  const clearSignature = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    setSignature('');
  };

  const selectPosition = (index: number) => {
    setSelectedPosition(index);
  };

  // Save signature to position
  const saveSignature = async () => {
    if (!signature || selectedPosition === null) {
      alert('Please draw your signature and select a position');
      return;
    }

    try {
      const position = positions[selectedPosition];
      const signatureData = {
        documentId,
        signatureId,
        position: {
          ...position,
          signature
        },
        signer: {
          email: recipientEmail,
          name: recipientName,
        }
      };

      const response = await fetch('/api/documents/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signatureData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save signature');
      }

      // Update positions array to mark this position as signed
      const updatedPositions = [...positions];
      updatedPositions[selectedPosition] = {
        ...updatedPositions[selectedPosition],
        signed: true,
      };
      setPositions(updatedPositions);
      setSelectedPosition(null);
      
      // Check if all required signatures are complete
      const allSigned = updatedPositions.every(p => p.signed);
      if (allSigned) {
        setSigningComplete(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save signature');
    }
  };

  const completeSigningProcess = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/complete-signing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ signatureId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete signing process');
      }

      onComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete signing process');
    }
  };

  const downloadSignedDocument = async () => {
    try {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download document');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-gray-700">Loading document for signing...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="flex flex-col items-center">
            <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center mb-4">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
            <p className="text-gray-700 mb-4">{error}</p>
            <button
              onClick={onCancel}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (signingComplete) {
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="flex flex-col items-center">
            <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Document Signed Successfully!</h3>
            <p className="text-gray-700 mb-4">
              Thank you for signing the document. Your signature has been recorded.
            </p>
            <div className="flex space-x-4 w-full">
              <button
                onClick={downloadSignedDocument}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
              <button
                onClick={completeSigningProcess}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Sign Document: {documentName}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Document Viewer */}
          <div className="w-2/3 border-r border-gray-200 overflow-auto bg-gray-100 relative">
            <iframe
              src={`${documentUrl}#page=${currentPage}`}
              className="w-full h-full border-0"
              title={documentName}
            />
            
            {/* Signature Position Indicators */}
            {positions
              .filter(pos => pos.page === currentPage)
              .map((pos, index) => (
                <div
                  key={index}
                  className={`absolute border-2 ${
                    selectedPosition === index
                      ? 'border-orange-500 bg-orange-100 bg-opacity-30'
                      : pos.signed
                      ? 'border-green-500 bg-green-100 bg-opacity-30'
                      : 'border-blue-500 bg-blue-100 bg-opacity-30 cursor-pointer'
                  } rounded-md flex items-center justify-center`}
                  style={{
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    width: '200px',
                    height: '50px',
                  }}
                  onClick={() => !pos.signed && selectPosition(index)}
                >
                  {pos.signed ? (
                    <img
                      src={pos.signature}
                      alt="Signature"
                      className="max-w-full max-h-full"
                    />
                  ) : (
                    <div className="text-sm text-blue-500">Click to sign here</div>
                  )}
                </div>
              ))}
            
            {/* Pagination Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-70 rounded-full px-4 py-2 text-white flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-orange-300'}`}
              >
                Previous
              </button>
              <span>Page {currentPage}</span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="hover:text-orange-300"
              >
                Next
              </button>
            </div>
          </div>
          
          {/* Signature Panel */}
          <div className="w-1/3 p-4 flex flex-col">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Your Signature</h4>
            
            {selectedPosition !== null ? (
              <div className="flex-1 flex flex-col">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Draw your signature below:
                  </p>
                  
                  <div 
                    ref={signatureContainerRef}
                    className="border border-gray-300 rounded-md bg-white overflow-hidden"
                  >
                    <canvas
                      ref={canvasRef}
                      width={320}
                      height={150}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      className="w-full touch-none"
                    />
                  </div>
                  
                  <div className="flex justify-between mt-2">
                    <button
                      onClick={clearSignature}
                      className="text-sm text-red-600 hover:text-red-800 flex items-center"
                    >
                      <Trash className="h-3 w-3 mr-1" /> Clear
                    </button>
                    <div className="text-xs text-gray-500">
                      Draw using your mouse or touch screen
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button
                    onClick={saveSignature}
                    disabled={!signature}
                    className={`w-full py-2 px-4 rounded-md flex items-center justify-center ${
                      signature
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Pen className="h-4 w-4 mr-2" />
                    Apply Signature
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                <Pen className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-center mb-2">
                  Click on a signature field in the document to start signing.
                </p>
                <p className="text-sm text-gray-500 text-center">
                  All required fields must be signed to complete the process.
                </p>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h5 className="font-medium text-gray-900 mb-2">Signing as:</h5>
              <div className="bg-gray-100 rounded-md p-3">
                <p className="font-medium">{recipientName || 'Guest'}</p>
                <p className="text-sm text-gray-600">{recipientEmail || 'No email provided'}</p>
              </div>
              
              <div className="mt-4">
                <button
                  onClick={onCancel}
                  className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSignature;