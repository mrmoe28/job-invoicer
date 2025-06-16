'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState, useEffect, useRef, useCallback } from 'react';

interface ExtractedData {
  homeownerName?: string;
  phoneNumber?: string;
  address?: string;
  numberOfPanels?: string;
  batteryType?: string;
  systemSize?: string;
  inverterType?: string;
  roofType?: string;
  utility?: string;
}

interface PdfViewerProps {
  fileUrl: string;
  fileName: string;
  onCloseAction: () => void;
  onExtractedDataAction?: (data: ExtractedData) => void;
}

export default function PdfViewer({ fileUrl, fileName, onCloseAction, onExtractedDataAction }: PdfViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [extractedText, setExtractedText] = useState<string>('');
  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<any>(null);

  // -- Helper to render a page (memoized) --
  const renderPage = useCallback(async (pageNum: number, pdf?: any) => {
    const pdfDoc = pdf || pdfDocRef.current;
    if (!pdfDoc || !canvasRef.current) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      const viewport = page.getViewport({ scale: zoomLevel });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  }, [zoomLevel]);

  // -- Helper to load a PDF (memoized) --
  const loadPdf = useCallback(async () => {
    try {
      setIsLoading(true);
      const pdfjsLib = (window as any).pdfjsLib;
      let src: any = fileUrl;
      // If fileUrl is a blob URL, fetch the blob and pass as data
      if (fileUrl.startsWith('blob:')) {
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        src = { data: arrayBuffer };
      }
      const pdf = await pdfjsLib.getDocument({
        ...((typeof src === 'string') ? { url: src } : src),
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true,
      }).promise;
      pdfDocRef.current = pdf;
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      renderPage(1, pdf);
    } catch (error) {
      console.error('Error loading PDF:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fileUrl, renderPage]);

  // -- Load PDF.js script and then the PDF --
  useEffect(() => {
    const loadPdfJs = async () => {
      if (typeof window !== 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          loadPdf();
        };
        document.head.appendChild(script);
      }
    };

    loadPdfJs();
  }, [loadPdf]);

  const extractTextFromPage = async (pageNum: number): Promise<string> => {
    const pdfDoc = pdfDocRef.current;
    if (!pdfDoc) return '';

    try {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      return textContent.items
        .map((item: any) => item.str)
        .join(' ');
    } catch (error) {
      console.error('Error extracting text from page:', error);
      return '';
    }
  };

  const extractAllText = async () => {
    setIsExtracting(true);
    const pdfDoc = pdfDocRef.current;
    if (!pdfDoc) return;

    try {
      let allText = '';
      const pagesToExtract = selectedPages.length > 0 ? selectedPages : Array.from({ length: totalPages }, (_, i) => i + 1);
      
      for (const pageNum of pagesToExtract) {
        const pageText = await extractTextFromPage(pageNum);
        allText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
      }
      
      setExtractedText(allText);
      analyzeText(allText);
    } catch (error) {
      console.error('Error extracting text:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const analyzeText = (text: string) => {
    const data: ExtractedData = {};

    // Extract homeowner name patterns
    const namePatterns = [
      /(?:owner|customer|homeowner)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
      /(?:name)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
      /(?:mr\.|mrs\.|ms\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
    ];

    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        data.homeownerName = match[1].trim();
        break;
      }
    }

    // Extract phone number
    const phonePattern = /(?:phone|tel|mobile|cell)[:\s]*(\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/i;
    const phoneMatch = text.match(phonePattern);
    if (phoneMatch) {
      data.phoneNumber = phoneMatch[1];
    }

    // Extract address
    const addressPatterns = [
      /(?:address|location)[:\s]+([0-9]+(?:\s+[A-Za-z]+)+(?:\s+(?:st|street|ave|avenue|rd|road|dr|drive|ln|lane|ct|court|blvd|boulevard)\.?))/i,
      /([0-9]+\s+[A-Za-z\s]+(?:st|street|ave|avenue|rd|road|dr|drive|ln|lane|ct|court|blvd|boulevard)\.?(?:\s*,?\s*[A-Za-z\s]+)?)/i,
    ];

    for (const pattern of addressPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.address = match[1].trim();
        break;
      }
    }

    // Extract number of panels
    const panelPatterns = [
      /(?:panels?|modules?)[:\s]*(\d+)/i,
      /(\d+)(?:\s+)?(?:panels?|modules?)/i,
      /(?:quantity|qty)[:\s]*(\d+)(?:\s+)?(?:panels?|modules?)/i,
    ];

    for (const pattern of panelPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.numberOfPanels = match[1];
        break;
      }
    }

    // Extract battery information
    const batteryPatterns = [
      /(?:battery|storage)[:\s]+([A-Za-z0-9\s-]+(?:kwh|kw)?)/i,
      /(tesla|lg|sonnen|enphase|generac|franklin|byd)(?:\s+[A-Za-z0-9\s-]+)?(?:\s+battery)?/i,
      /(\d+(?:\.\d+)?\s*kwh?)(?:\s+battery|\s+storage)/i,
    ];

    for (const pattern of batteryPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.batteryType = match[1].trim();
        break;
      }
    }

    // Extract system size
    const systemSizePatterns = [
      /(?:system\s+size|capacity)[:\s]+(\d+(?:\.\d+)?\s*kw)/i,
      /(\d+(?:\.\d+)?\s*kw)(?:\s+system|\s+capacity)/i,
    ];

    for (const pattern of systemSizePatterns) {
      const match = text.match(pattern);
      if (match) {
        data.systemSize = match[1];
        break;
      }
    }

    // Extract inverter type
    const inverterPatterns = [
      /(?:inverter)[:\s]+([A-Za-z0-9\s-]+)/i,
      // cspell:ignore tigo apsystems
      /(solaredge|enphase|sma|fronius|apsystems|tigo)(?:\s+[A-Za-z0-9\s-]+)?/i,
    ];

    for (const pattern of inverterPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.inverterType = match[1].trim();
        break;
      }
    }

    // Extract roof type
    const roofPatterns = [
      /(?:roof|roofing)[:\s]+([A-Za-z\s]+)/i,
      /(asphalt|tile|metal|slate|cedar|composite)(?:\s+(?:shingle|roof|roofing))?/i,
    ];

    for (const pattern of roofPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.roofType = match[1].trim();
        break;
      }
    }

    // Extract utility company
    const utilityPatterns = [
      /(?:utility|electric\s+company)[:\s]+([A-Za-z\s&]+)/i,
      /(pg&e|sdg&e|sce|pge|pacific\s+gas|san\s+diego\s+gas|southern\s+california\s+edison)/i,
    ];

    for (const pattern of utilityPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.utility = match[1].trim();
        break;
      }
    }

    setExtractedData(data);
    if (onExtractedDataAction) {
      onExtractedDataAction(data);
    }
  };

  const handlePageSelect = (pageNum: number) => {
    setSelectedPages(prev => 
      prev.includes(pageNum) 
        ? prev.filter(p => p !== pageNum)
        : [...prev, pageNum].sort((a, b) => a - b)
    );
  };

  const selectAllPages = () => {
    setSelectedPages(Array.from({ length: totalPages }, (_, i) => i + 1));
  };

  const clearSelection = () => {
    setSelectedPages([]);
  };

  const goToPage = (pageNum: number) => {
    setCurrentPage(pageNum);
    renderPage(pageNum);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      renderPage(newPage);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      renderPage(newPage);
    }
  };

  const zoomIn = () => {
    const newZoom = Math.min(zoomLevel * 1.2, 3);
    setZoomLevel(newZoom);
    renderPage(currentPage);
  };

  const zoomOut = () => {
    const newZoom = Math.max(zoomLevel / 1.2, 0.5);
    setZoomLevel(newZoom);
    renderPage(currentPage);
  };

  const resetZoom = () => {
    setZoomLevel(1);
    renderPage(currentPage);
  };

  useEffect(() => {
    if (zoomLevel && currentPage) {
      renderPage(currentPage);
    }
  }, [currentPage, renderPage, zoomLevel]);

  // Add pinch-to-zoom handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let lastDistance = 0;
    let isPinching = false;

    function getTouchDistance(touches: TouchList) {
      if (touches.length < 2) return 0;
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function handleTouchStart(e: TouchEvent) {
      if (e.touches.length === 2) {
        isPinching = true;
        lastDistance = getTouchDistance(e.touches);
      }
    }

    function handleTouchMove(e: TouchEvent) {
      if (isPinching && e.touches.length === 2) {
        const newDistance = getTouchDistance(e.touches);
        if (lastDistance) {
          const scale = newDistance / lastDistance;
          let newZoom = zoomLevel * scale;
          newZoom = Math.max(0.5, Math.min(3, newZoom));
          setZoomLevel(newZoom);
        }
        lastDistance = newDistance;
        e.preventDefault();
      }
    }

    function handleTouchEnd(e: TouchEvent) {
      if (e.touches.length < 2) {
        isPinching = false;
        lastDistance = 0;
      }
    }

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [zoomLevel]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col z-50">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-white">{fileName}</h3>
          {!isLoading && (
            <span className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showAnalysis 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Analysis
          </button>

          <button
            onClick={extractAllText}
            disabled={isExtracting}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isExtracting ? 'Extracting...' : 'Extract Data'}
          </button>

          <div className="flex items-center space-x-1 border border-gray-600 rounded-lg">
            <button onClick={zoomOut} className="p-2 text-gray-400 hover:text-white">-</button>
            <span className="text-sm text-gray-400 min-w-[3rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button onClick={zoomIn} className="p-2 text-gray-400 hover:text-white">+</button>
            <button onClick={resetZoom} className="px-2 py-1 text-xs text-gray-400 hover:text-white border-l border-gray-600">
              Reset
            </button>
          </div>

          <button onClick={onCloseAction} className="p-2 text-gray-400 hover:text-white">×</button>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          <div className="bg-gray-900 border-b border-gray-700 p-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button onClick={prevPage} disabled={currentPage <= 1} className="p-2 text-gray-400 hover:text-white disabled:opacity-50">‹</button>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    goToPage(page);
                  }
                }}
                className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center text-sm"
              />
              <button onClick={nextPage} disabled={currentPage >= totalPages} className="p-2 text-gray-400 hover:text-white disabled:opacity-50">›</button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                {selectedPages.length > 0 && `${selectedPages.length} pages selected`}
              </span>
              <button
                onClick={() => handlePageSelect(currentPage)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  selectedPages.includes(currentPage) ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {selectedPages.includes(currentPage) ? 'Deselect' : 'Select'} Page
              </button>
              <button onClick={selectAllPages} className="px-3 py-1 text-xs bg-gray-700 text-gray-300 hover:bg-gray-600 rounded">
                Select All
              </button>
              <button onClick={clearSelection} className="px-3 py-1 text-xs bg-gray-700 text-gray-300 hover:bg-gray-600 rounded">
                Clear
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-gray-900 p-4 flex items-center justify-center">
            {isLoading ? (
              <div className="text-center">
                <div className="w-8 h-8 bg-orange-500 rounded-full animate-pulse mx-auto mb-4"></div>
                <p className="text-gray-400">Loading PDF...</p>
              </div>
            ) : (
              <canvas ref={canvasRef} className="border border-gray-600 shadow-2xl max-w-full max-h-full" />
            )}
          </div>
        </div>

        {showAnalysis && (
          <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-2">Document Analysis</h3>
              <span className="text-sm text-gray-400">
                {selectedPages.length > 0 
                  ? `Analyzing ${selectedPages.length} selected pages`
                  : 'Will analyze all pages'
                }
              </span>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Extracted Information</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(extractedData).map(([key, value]) => {
                    if (!value) return null;
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    return (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-400">{label}:</span>
                        <span className="text-white font-medium">{value}</span>
                      </div>
                    );
                  })}
                  {Object.values(extractedData).every(v => !v) && (
                    <p className="text-gray-400 italic">Click &quot;Extract Data&quot; to analyze the document</p>
                  )}
                </div>
              </div>

              {extractedText && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Extracted Text Preview</h4>
                  <div className="bg-gray-800 rounded p-2 max-h-64 overflow-y-auto">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                      {extractedText.substring(0, 1000)}
                      {extractedText.length > 1000 && '...'}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 