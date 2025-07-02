'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Maximize2, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  BookOpen,
  Share2,
  FileText,
  AlertCircle,
  Loader,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

interface EnhancedPDFViewerProps {
  fileUrl: string;
  fileName?: string;
  className?: string;
  onClose?: () => void;
  showControls?: boolean;
  height?: string;
  onLoadSuccess?: (pdf: any) => void;
  onLoadError?: (error: Error) => void;
}

export default function EnhancedPDFViewer({
  fileUrl,
  fileName,
  className,
  onClose,
  showControls = true,
  height = '800px',
  onLoadSuccess,
  onLoadError,
}: EnhancedPDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [pdfInfo, setPdfInfo] = useState<any>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<{ [key: number]: HTMLDivElement }>({});

  // Load PDF document
  const onDocumentLoadSuccess = useCallback(
    ({ numPages, ...info }: { numPages: number }) => {
      setNumPages(numPages);
      setPageNumber(1);
      setLoading(false);
      setError(null);
      setPdfInfo(info);
      onLoadSuccess?.({ numPages, ...info });
    },
    [onLoadSuccess]
  );

  const onDocumentLoadError = useCallback(
    (error: Error) => {
      setLoading(false);
      setError(error.message || 'Failed to load PDF');
      onLoadError?.(error);
    },
    [onLoadError]
  );

  // Navigation
  const goToPrevPage = useCallback(() => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  }, [numPages]);

  const goToPage = useCallback((page: number) => {
    setPageNumber(Math.max(1, Math.min(page, numPages)));
  }, [numPages]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.25, 5.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.25, 0.25));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1.0);
  }, []);

  const fitToWidth = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 40; // Account for padding
      const pageWidth = 595; // Standard PDF page width in points
      const newScale = containerWidth / pageWidth;
      setScale(Math.max(0.25, Math.min(newScale, 5.0)));
    }
  }, []);

  // Rotation
  const rotateClockwise = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  // Download
  const downloadPDF = useCallback(() => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName || fileUrl.split('/').pop() || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [fileUrl, fileName]);

  // Share
  const sharePDF = useCallback(async () => {
    if (navigator.share && fileUrl) {
      try {
        await navigator.share({
          title: fileName || 'PDF Document',
          url: fileUrl,
        });
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(fileUrl);
        alert('PDF URL copied to clipboard');
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(fileUrl);
      alert('PDF URL copied to clipboard');
    }
  }, [fileUrl, fileName]);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          goToPrevPage();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          goToNextPage();
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
        case 'f':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowSearch(true);
          }
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen();
          } else if (showSearch) {
            setShowSearch(false);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevPage, goToNextPage, zoomIn, zoomOut, resetZoom, isFullscreen, showSearch]);

  // Generate thumbnail pages for sidebar
  const renderThumbnails = () => {
    if (!showThumbnails || numPages === 0) return null;

    return (
      <div className="w-48 bg-gray-900 border-r border-gray-700 overflow-y-auto">
        <div className="p-3 border-b border-gray-700">
          <h3 className="text-sm font-medium text-white">Pages ({numPages})</h3>
        </div>
        <div className="p-2 space-y-2">
          {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
            <div
              key={page}
              onClick={() => goToPage(page)}
              className={cn(
                "relative cursor-pointer rounded border-2 transition-all",
                page === pageNumber 
                  ? "border-orange-500 bg-orange-500/10" 
                  : "border-gray-700 hover:border-gray-600"
              )}
            >
              <div className="aspect-[3/4] bg-white rounded">
                <Document file={fileUrl} loading={null} error={null}>
                  <Page
                    pageNumber={page}
                    scale={0.15}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="w-full h-full"
                  />
                </Document>
              </div>
              <div className="absolute bottom-1 left-1 right-1 text-center">
                <span className="text-xs text-white bg-black bg-opacity-75 px-1 rounded">
                  {page}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!fileUrl) {
    return (
      <div className={cn('border border-gray-700 rounded-lg p-8 text-center bg-gray-800', className)}>
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">No PDF file selected</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        'bg-gray-900 rounded-lg overflow-hidden flex flex-col',
        isFullscreen && 'fixed inset-0 z-50 rounded-none',
        className
      )}
    >
      {/* Header Controls */}
      {showControls && (
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* File Info */}
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="font-medium text-white truncate max-w-md">
                  {fileName || 'PDF Document'}
                </h3>
                {pdfInfo && (
                  <p className="text-sm text-gray-400">
                    {numPages} pages
                    {pdfInfo.info?.Title && ` • ${pdfInfo.info.Title}`}
                  </p>
                )}
              </div>
            </div>

            {/* Search */}
            {showSearch && (
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search in PDF..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-orange-500 focus:outline-none"
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => setShowSearch(false)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                title="Search (Ctrl+F)"
              >
                <Search className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setShowThumbnails(!showThumbnails)}
                className={cn(
                  "p-2 rounded transition-colors",
                  showThumbnails 
                    ? "bg-orange-500 text-white" 
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                )}
                title="Toggle Thumbnails"
              >
                <BookOpen className="w-4 h-4" />
              </button>

              <div className="h-6 w-px bg-gray-600" />

              <button
                onClick={downloadPDF}
                className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={sharePDF}
                className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                title="Share PDF"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation and Zoom Controls */}
          <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
            {/* Page Navigation */}
            <div className="flex items-center space-x-3">
              <button
                onClick={goToPrevPage}
                disabled={pageNumber <= 1 || loading}
                className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min={1}
                  max={numPages}
                  value={pageNumber}
                  onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1 bg-gray-700 text-white text-center rounded border border-gray-600 focus:border-orange-500 focus:outline-none"
                />
                <span className="text-gray-400">of {numPages || '--'}</span>
              </div>

              <button
                onClick={goToNextPage}
                disabled={pageNumber >= numPages || loading}
                className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={zoomOut}
                disabled={loading}
                className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              
              <span className="text-sm text-gray-300 min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              
              <button
                onClick={zoomIn}
                disabled={loading}
                className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                onClick={fitToWidth}
                disabled={loading}
                className="px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 transition-colors text-sm"
              >
                Fit Width
              </button>

              <button
                onClick={resetZoom}
                disabled={loading}
                className="px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 transition-colors text-sm"
              >
                Reset
              </button>

              <button
                onClick={rotateClockwise}
                disabled={loading}
                className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Thumbnails Sidebar */}
        {renderThumbnails()}

        {/* PDF Viewer */}
        <div 
          className="flex-1 overflow-auto bg-gray-100"
          style={{ height: showControls ? 'calc(100% - 140px)' : height }}
        >
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader className="w-8 h-8 text-orange-500 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading PDF...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading PDF</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {!loading && !error && fileUrl && (
            <div className="flex justify-center p-4">
              <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={null}
                error={null}
                className="pdf-document"
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  rotate={rotation}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="pdf-page shadow-2xl border border-gray-300"
                />
              </Document>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      {isFullscreen && (
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs">
          <div>← → Navigate • + - Zoom • F11 Exit Fullscreen</div>
        </div>
      )}
    </div>
  );
}
