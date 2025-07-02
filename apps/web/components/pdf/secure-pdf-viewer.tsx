'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '../ui/button';
import { Icons, LoadingIcon } from '../ui/icons';
import { cn } from '../../lib/utils';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

interface SecurePDFViewerProps {
    fileUrl: string;
    className?: string;
    showControls?: boolean;
    height?: string;
    onLoadSuccess?: (pdf: any) => void;
    onLoadError?: (error: Error) => void;
}

export default function SecurePDFViewer({
    fileUrl,
    className,
    showControls = true,
    height = '600px',
    onLoadSuccess,
    onLoadError,
}: SecurePDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [pdfFile, setPdfFile] = useState<string | null>(null);

    // Load PDF file
    useEffect(() => {
        if (fileUrl) {
            setLoading(true);
            setError(null);
            setPdfFile(fileUrl);
        }
    }, [fileUrl]);

    const onDocumentLoadSuccess = useCallback(
        ({ numPages }: { numPages: number }) => {
            setNumPages(numPages);
            setPageNumber(1);
            setLoading(false);
            setError(null);
            onLoadSuccess?.({ numPages });
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

    const goToPrevPage = useCallback(() => {
        setPageNumber((prev) => Math.max(prev - 1, 1));
    }, []);

    const goToNextPage = useCallback(() => {
        setPageNumber((prev) => Math.min(prev + 1, numPages));
    }, [numPages]);

    const zoomIn = useCallback(() => {
        setScale((prev) => Math.min(prev + 0.2, 3.0));
    }, []);

    const zoomOut = useCallback(() => {
        setScale((prev) => Math.max(prev - 0.2, 0.5));
    }, []);

    const resetZoom = useCallback(() => {
        setScale(1.0);
    }, []);

    const downloadPDF = useCallback(() => {
        if (fileUrl) {
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = fileUrl.split('/').pop() || 'document.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }, [fileUrl]);

    const openFullscreen = useCallback(() => {
        if (fileUrl) {
            window.open(fileUrl, '_blank');
        }
    }, [fileUrl]);

    if (!fileUrl) {
        return (
            <div className={cn('border border-gray-300 rounded-lg p-8 text-center', className)}>
                <Icons.FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No PDF file selected</p>
            </div>
        );
    }

    return (
        <div className={cn('border border-gray-300 rounded-lg overflow-hidden', className)}>
            {/* Controls */}
            {showControls && (
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToPrevPage}
                            disabled={pageNumber <= 1 || loading}
                        >
                            <Icons.ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-gray-600">
                            {loading ? '--' : pageNumber} of {loading ? '--' : numPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToNextPage}
                            disabled={pageNumber >= numPages || loading}
                        >
                            <Icons.ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={zoomOut} disabled={loading}>
                            <Icons.ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-gray-600 min-w-[60px] text-center">
                            {Math.round(scale * 100)}%
                        </span>
                        <Button variant="outline" size="sm" onClick={zoomIn} disabled={loading}>
                            <Icons.ZoomIn className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={resetZoom} disabled={loading}>
                            Reset
                        </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={downloadPDF} disabled={loading}>
                            <Icons.Download className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={openFullscreen} disabled={loading}>
                            <Icons.Maximize className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* PDF Content */}
            <div
                className="relative overflow-auto bg-gray-100"
                style={{ height }}
            >
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                        <div className="text-center">
                            <LoadingIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                            <p className="text-gray-600">Loading PDF...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                        <div className="text-center p-8">
                            <Icons.AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading PDF</h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <Button onClick={() => window.location.reload()} variant="outline">
                                Retry
                            </Button>
                        </div>
                    </div>
                )}

                {pdfFile && (
                    <div className="flex justify-center p-4">
                        <Document
                            file={pdfFile}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={null}
                            error={null}
                            className="pdf-document"
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                className="pdf-page shadow-lg"
                            />
                        </Document>
                    </div>
                )}
            </div>
        </div>
    );
}

// Export types for convenience
export type { SecurePDFViewerProps }; 