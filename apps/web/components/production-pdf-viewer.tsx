'use client';

import { useState, useCallback, useEffect } from 'react';

interface ProductionPdfViewerProps {
  fileUrl: string;
  fileName: string;
  onCloseAction: () => void;
}

export default function ProductionPdfViewer({ 
  fileUrl, 
  fileName, 
  onCloseAction 
}: ProductionPdfViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [fallbackMode, setFallbackMode] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setError('');
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    if (!fallbackMode) {
      setFallbackMode(true);
      setError('PDF viewer had issues. Showing fallback options.');
    } else {
      setError('PDF cannot be displayed. Please download the file to view it.');
    }
  }, [fallbackMode]);

  const downloadPdf = useCallback(async () => {
    try {
      const downloadUrl = fileUrl.includes('?') ? `${fileUrl}&download=true` : `${fileUrl}?download=true`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      setError(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [fileUrl, fileName]);

  const openInNewTab = useCallback(() => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  }, [fileUrl]);

  // Keyboard shortcut for closing
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseAction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCloseAction]);

  const renderPdfViewer = () => {
    if (fallbackMode || error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-white mb-2">PDF Preview</h4>
            <p className="text-gray-400 mb-6">
              {error || 'This PDF can be downloaded or opened in a new tab for viewing.'}
            </p>
            <div className="space-y-3">
              <button
                onClick={downloadPdf}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Download PDF
              </button>
              <button
                onClick={openInNewTab}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Open in New Tab
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Enhanced iframe with better fallback handling
    const iframeSrc = fileUrl.includes('#') ? fileUrl : `${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`;
    
    return (
      <iframe
        src={iframeSrc}
        title={fileName}
        className="w-full h-full border-0"
        onLoad={handleLoad}
        onError={handleError}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        style={{ minHeight: '500px' }}
      />
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col z-50">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-white">{fileName}</h3>
          <span className="text-sm text-gray-400">PDF Document</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Download Button */}
          <button
            onClick={downloadPdf}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            title="Download PDF"
          >
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </button>

          {/* Open in New Tab */}
          <button
            onClick={openInNewTab}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            title="Open in new tab"
          >
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            New Tab
          </button>

          {/* Close Button */}
          <button
            onClick={onCloseAction}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Close viewer (ESC)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* PDF Viewer Content */}
      <div className="flex-1 bg-gray-900 relative overflow-hidden">
        {isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="text-center">
              <div className="w-8 h-8 bg-orange-500 rounded-full animate-pulse mx-auto mb-4"></div>
              <p className="text-gray-400">Loading PDF...</p>
            </div>
          </div>
        )}
        
        {renderPdfViewer()}
      </div>
      
      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 p-2 text-center flex-shrink-0">
        <p className="text-sm text-gray-400">
          PDF Viewer • Production Mode
          {!error && !isLoading && " • PDF loaded successfully"}
          {error && " • Use download or new tab if viewing issues occur"}
          {isLoading && " • Loading..."}
        </p>
      </div>
    </div>
  );
}
