'use client';

import { useState } from 'react';

interface SimplePdfViewerProps {
  fileUrl: string;
  fileName: string;
  onCloseAction: () => void;
}

export default function SimplePdfViewer({ fileUrl, fileName, onCloseAction }: SimplePdfViewerProps) {
  const [viewerType, setViewerType] = useState<'iframe' | 'object' | 'embed'>('iframe');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const handleLoad = () => {
    setIsLoading(false);
    setError('');
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load PDF. Trying alternative viewer...');
    // Try different viewer types
    if (viewerType === 'iframe') {
      setViewerType('object');
    } else if (viewerType === 'object') {
      setViewerType('embed');
    }
  };

  const downloadPdf = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openInNewTab = () => {
    window.open(fileUrl, '_blank');
  };

  const renderPdfViewer = () => {
    const commonProps = {
      width: '100%',
      height: '100%',
      onLoad: handleLoad,
      onError: handleError,
    };

    switch (viewerType) {
      case 'iframe':
        return (
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1&page=1&zoom=fit`}
            title={fileName}
            className="w-full h-full border-0"
            {...commonProps}
          />
        );
      
      case 'object':
        return (
          <object
            data={fileUrl}
            type="application/pdf"
            className="w-full h-full"
            {...commonProps}
          >
            <p className="text-white text-center py-8">
              Your browser doesn't support PDF viewing. 
              <button 
                onClick={downloadPdf}
                className="text-orange-500 hover:text-orange-400 underline ml-1"
              >
                Download the PDF instead
              </button>
            </p>
          </object>
        );
      
      case 'embed':
        return (
          <embed
            src={fileUrl}
            type="application/pdf"
            className="w-full h-full"
            {...commonProps}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col z-50">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-white">{fileName}</h3>
          <span className="text-sm text-gray-400">PDF Document</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Viewer Type Selector */}
          <select
            value={viewerType}
            onChange={(e) => setViewerType(e.target.value as any)}
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded px-2 py-1"
          >
            <option value="iframe">IFrame Viewer</option>
            <option value="object">Object Viewer</option>
            <option value="embed">Embed Viewer</option>
          </select>

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
            title="Close viewer"
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
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-white mb-2">PDF Loading Issue</h4>
              <p className="text-gray-400 mb-4">{error}</p>
              <div className="space-x-2">
                <button
                  onClick={downloadPdf}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Download PDF
                </button>
                <button
                  onClick={openInNewTab}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Open in New Tab
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
          PDF Viewer • {viewerType.toUpperCase()} mode • 
          {!error && !isLoading && " PDF loaded successfully"}
          {error && " Try switching viewer type or download the file"}
        </p>
      </div>
    </div>
  );
}