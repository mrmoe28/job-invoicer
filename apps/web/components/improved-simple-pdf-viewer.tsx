'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface ImprovedSimplePdfViewerProps {
  fileUrl: string;
  fileName: string;
  onCloseAction: () => void;
}

export default function ImprovedSimplePdfViewer({ 
  fileUrl, 
  fileName, 
  onCloseAction 
}: ImprovedSimplePdfViewerProps) {
  const [viewerType, setViewerType] = useState<'iframe' | 'object' | 'embed' | 'download'>('iframe');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const maxRetries = 3;
  const loadTimeout = 15000; // 15 seconds

  // Reset loading state when URL or viewer type changes
  useEffect(() => {
    setIsLoading(true);
    setError('');
    setRetryCount(0);
  }, [fileUrl, viewerType]);

  // Set up loading timeout
  useEffect(() => {
    if (isLoading) {
      timeoutRef.current = setTimeout(() => {
        handleError(new Error('PDF loading timeout - the file is taking too long to load'));
      }, loadTimeout);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setError('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const handleError = useCallback((error?: Error | Event) => {
    setIsLoading(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Try different viewer types automatically
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      
      // Cycle through viewer types
      if (viewerType === 'iframe') {
        setViewerType('object');
        setError('IFrame failed, trying Object viewer...');
      } else if (viewerType === 'object') {
        setViewerType('embed');
        setError('Object viewer failed, trying Embed viewer...');
      } else if (viewerType === 'embed') {
        setError('All viewers failed. This may be due to CORS restrictions or an invalid PDF URL.');
        setViewerType('download');
      }
    } else {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load PDF. This may be due to CORS restrictions or network issues.';
      setError(errorMessage);
    }
  }, [viewerType, retryCount]);

  const downloadPdf = useCallback(async () => {
    try {
      // First try to fetch the PDF to check if it's accessible
      const response = await fetch(fileUrl, { method: 'HEAD' });
      
      if (!response.ok) {
        throw new Error(`PDF not accessible: ${response.status} ${response.statusText}`);
      }

      // If accessible, proceed with download
      const link = document.createElement('a');
      link.href = fileUrl;
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
    const newWindow = window.open(fileUrl, '_blank', 'noopener,noreferrer');
    if (!newWindow) {
      setError('Failed to open PDF in new tab. Pop-ups may be blocked.');
    }
  }, [fileUrl]);

  const retryLoad = useCallback(() => {
    setRetryCount(0);
    setError('');
    setIsLoading(true);
    setViewerType('iframe'); // Start over with iframe
  }, []);

  const renderPdfViewer = useCallback(() => {
    const viewerProps = {
      onLoad: handleLoad,
      onError: handleError,
      style: { width: '100%', height: '100%' }
    };

    switch (viewerType) {
      case 'iframe':
        return (
          <iframe
            ref={iframeRef}
            src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1&page=1&zoom=fit`}
            title={fileName}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups"
            {...viewerProps}
          />
        );
      
      case 'object':
        return (
          <object
            data={fileUrl}
            type="application/pdf"
            className="w-full h-full"
            {...viewerProps}
          >
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-white mb-4">
                  Your browser doesn't support this PDF viewer mode.
                </p>
                <button 
                  onClick={downloadPdf}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </object>
        );
      
      case 'embed':
        return (
          <embed
            src={fileUrl}
            type="application/pdf"
            className="w-full h-full"
            {...viewerProps}
          />
        );
      
      case 'download':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-white mb-2">PDF Preview Unavailable</h4>
              <p className="text-gray-400 mb-6">
                The PDF cannot be displayed in your browser. This may be due to CORS restrictions or browser security settings.
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
                <button
                  onClick={retryLoad}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Retry Loading
                </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  }, [viewerType, fileUrl, fileName, handleLoad, handleError, downloadPdf, openInNewTab, retryLoad]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col z-50">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-white">{fileName}</h3>
          <span className="text-sm text-gray-400">PDF Document</span>
          {retryCount > 0 && (
            <span className="text-xs text-orange-400">
              (Attempt {retryCount + 1}/{maxRetries + 1})
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Viewer Type Selector */}
          <select
            value={viewerType}
            onChange={(e) => setViewerType(e.target.value as any)}
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded px-2 py-1"
            disabled={isLoading}
          >
            <option value="iframe">IFrame Viewer</option>
            <option value="object">Object Viewer</option>
            <option value="embed">Embed Viewer</option>
            <option value="download">Download Only</option>
          </select>

          {/* Retry Button */}
          <button
            onClick={retryLoad}
            disabled={isLoading}
            className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry
          </button>

          {/* Download Button */}
          <button
            onClick={downloadPdf}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
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
      <div className="flex-1 bg-gray-900 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="w-8 h-8 bg-orange-500 rounded-full animate-pulse mx-auto mb-4"></div>
              <p className="text-gray-400">Loading PDF...</p>
              <p className="text-xs text-gray-500 mt-2">Using {viewerType.toUpperCase()} viewer</p>
            </div>
          </div>
        )}
        
        {error && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center py-16 max-w-md">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-white mb-2">PDF Loading Issue</h4>
              <p className="text-gray-400 mb-4 text-sm">{error}</p>
              <div className="space-x-2">
                <button
                  onClick={retryLoad}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={downloadPdf}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
        
        {!error && renderPdfViewer()}
      </div>
      
      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 p-2 text-center">
        <p className="text-sm text-gray-400">
          PDF Viewer • {viewerType.toUpperCase()} mode
          {!error && !isLoading && " • PDF loaded successfully"}
          {error && " • Try switching viewer type or download the file"}
          {isLoading && " • Loading..."}
        </p>
      </div>
    </div>
  );
}

// Keyboard shortcuts handler
export function usePdfViewerKeyboard(onClose: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
}
