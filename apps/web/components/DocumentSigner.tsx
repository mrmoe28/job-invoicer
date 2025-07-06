'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
// import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
// import 'react-pdf/dist/esm/Page/TextLayer.css';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  X, 
  Edit3,
  Save,
  MousePointer
} from 'lucide-react';
import SignaturePad from './SignaturePad';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface SignatureField {
  id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  signature?: string;
}

interface DocumentSignerProps {
  url: string;
  title?: string;
  onComplete?: (signatures: SignatureField[]) => void;
  onClose?: () => void;
}

export default function DocumentSigner({ url, title, onComplete, onClose }: DocumentSignerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlacingSignature, setIsPlacingSignature] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signatureFields, setSignatureFields] = useState<SignatureField[]>([]);
  const [currentFieldId, setCurrentFieldId] = useState<string | null>(null);
  const [pageRefs, setPageRefs] = useState<{ [key: number]: HTMLDivElement | null }>({});

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error('PDF load error:', error);
    setError('Failed to load PDF. Please try again.');
    setLoading(false);
  }

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlacingSignature) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100; // Percentage
    const y = ((e.clientY - rect.top) / rect.height) * 100; // Percentage

    const newField: SignatureField = {
      id: Date.now().toString(),
      page: pageNumber,
      x,
      y,
      width: 200 / rect.width * 100, // Convert to percentage
      height: 80 / rect.height * 100, // Convert to percentage
    };

    setSignatureFields([...signatureFields, newField]);
    setCurrentFieldId(newField.id);
    setShowSignaturePad(true);
    setIsPlacingSignature(false);
  };

  const handleSignatureSave = (signature: string) => {
    if (!currentFieldId) return;

    setSignatureFields(fields =>
      fields.map(field =>
        field.id === currentFieldId
          ? { ...field, signature }
          : field
      )
    );
    setShowSignaturePad(false);
    setCurrentFieldId(null);
  };

  const handleRemoveSignature = (fieldId: string) => {
    setSignatureFields(fields => fields.filter(f => f.id !== fieldId));
  };

  const handleComplete = () => {
    if (signatureFields.length === 0) {
      alert('Please add at least one signature');
      return;
    }

    const unsignedFields = signatureFields.filter(f => !f.signature);
    if (unsignedFields.length > 0) {
      alert('Please complete all signature fields');
      return;
    }

    onComplete?.(signatureFields);
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.max(1, Math.min(newPageNumber, numPages));
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <h3 className="text-white font-medium">
          {title || 'Sign Document'}
        </h3>
        <div className="flex items-center gap-4">
          {/* Place Signature Button */}
          <button
            onClick={() => setIsPlacingSignature(!isPlacingSignature)}
            className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
              isPlacingSignature
                ? 'bg-orange-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:text-white'
            }`}
          >
            {isPlacingSignature ? (
              <>
                <MousePointer className="w-4 h-4" />
                Click to place signature
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                Add Signature
              </>
            )}
          </button>

          {/* Complete Button */}
          <button
            onClick={handleComplete}
            disabled={signatureFields.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            Complete Signing
          </button>

          {/* Close */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        {loading && (
          <div className="text-white">Loading document...</div>
        )}
        
        {error && (
          <div className="text-red-500 text-center">
            <p>{error}</p>
          </div>
        )}

        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
          className="max-w-full"
        >
          {!loading && !error && (
            <div className="relative">
              <div
                ref={ref => setPageRefs({ ...pageRefs, [pageNumber]: ref })}
                onClick={handlePageClick}
                className={`relative ${isPlacingSignature ? 'cursor-crosshair' : ''}`}
              >
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale}
                  className="shadow-2xl"
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
                
                {/* Render signature fields for current page */}
                {signatureFields
                  .filter(field => field.page === pageNumber)
                  .map(field => (
                    <div
                      key={field.id}
                      className="absolute border-2 border-orange-500 bg-orange-500/10 rounded group"
                      style={{
                        left: `${field.x}%`,
                        top: `${field.y}%`,
                        width: `${field.width}%`,
                        height: `${field.height}%`,
                      }}
                    >
                      {field.signature ? (
                        <img 
                          src={field.signature} 
                          alt="Signature" 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-orange-500 text-sm">Sign Here</span>
                        </div>
                      )}
                      
                      {/* Remove button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSignature(field.id);
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </Document>
      </div>

      {/* Footer with Navigation */}
      {!loading && !error && numPages > 0 && (
        <div className="bg-gray-900 border-t border-gray-700 px-4 py-3 flex items-center justify-center gap-4">
          <button
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-gray-400 text-sm">
            Page {pageNumber} of {numPages}
          </span>
          
          <button
            onClick={() => changePage(1)}
            disabled={pageNumber >= numPages}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Signature Pad Modal */}
      {showSignaturePad && (
        <SignaturePad
          onSave={handleSignatureSave}
          onClose={() => {
            setShowSignaturePad(false);
            setCurrentFieldId(null);
          }}
        />
      )}
    </div>
  );
}