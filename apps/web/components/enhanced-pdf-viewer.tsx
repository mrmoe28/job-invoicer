'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

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

interface EnhancedPdfViewerProps {
  fileUrl: string;
  fileName: string;
  onCloseAction: () => void;
  onExtractedDataAction?: (data: ExtractedData) => void;
}

export default function EnhancedPdfViewer({ 
  fileUrl, 
  fileName, 
  onCloseAction, 
  onExtractedDataAction 
}: EnhancedPdfViewerProps) {
  // This component serves as a placeholder for the enhanced react-pdf viewer
  // Since react-pdf is not currently installed, we'll show a fallback message
  
  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const [isExtracting, setIsExtracting] = useState(false);

  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [fileUrl, fileName]);

  const handleOpenNewTab = useCallback(() => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  }, [fileUrl]);

  // Load PDF.js if not already loaded
  const loadPdfJs = useCallback(async (): Promise<any> => {
    // Check if PDF.js is already loaded
    if ((window as any).pdfjsLib) {
      return (window as any).pdfjsLib;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.js';
      script.async = true;
      
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        if (pdfjsLib) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js';
          resolve(pdfjsLib);
        } else {
          reject(new Error('PDF.js failed to initialize'));
        }
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load PDF.js library'));
      };
      
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="pdf.min.js"]');
      if (existingScript) {
        // Script exists, check if PDF.js is available
        if ((window as any).pdfjsLib) {
          resolve((window as any).pdfjsLib);
        } else {
          // Wait a bit for script to load
          setTimeout(() => {
            if ((window as any).pdfjsLib) {
              resolve((window as any).pdfjsLib);
            } else {
              reject(new Error('PDF.js library not available'));
            }
          }, 1000);
        }
      } else {
        document.head.appendChild(script);
      }
    });
  }, []);

  // Text extraction using direct PDF.js
  const extractTextFromDocument = useCallback(async () => {
    setIsExtracting(true);
    
    try {
      // Load PDF.js library
      const pdfjsLib = await loadPdfJs();
      
      console.log('PDF.js loaded, attempting to process:', fileUrl);
      
      // Try to load the PDF document
      let pdf;
      try {
        pdf = await pdfjsLib.getDocument({
          url: fileUrl,
          // Handle CORS issues
          httpHeaders: {},
          withCredentials: false,
          // Disable range requests for external URLs
          disableRange: true,
          disableStream: true
        }).promise;
      } catch (pdfError) {
        console.error('PDF loading error:', pdfError);
        throw new Error(`Cannot load PDF: ${pdfError.message}. This might be due to CORS restrictions or an invalid PDF URL.`);
      }
      
      console.log(`PDF loaded successfully. Pages: ${pdf.numPages}`);
      
      let allText = '';
      let extractedCount = 0;
      
      // Extract text from all pages
      for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 10); pageNum++) { // Limit to first 10 pages for demo
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          
          if (pageText.trim()) {
            allText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
            extractedCount++;
          }
        } catch (pageError) {
          console.warn(`Failed to extract text from page ${pageNum}:`, pageError);
        }
      }
      
      console.log(`Extracted text from ${extractedCount} pages`);
      
      if (!allText.trim()) {
        throw new Error('No text could be extracted from this PDF. The PDF might be image-based or protected.');
      }
      
      // Simple text analysis
      const data: ExtractedData = {};
      
      // Extract basic information with more patterns
      const namePatterns = [
        /(?:name|customer|client)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
        /([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s+[A-Z][a-z]+)*/,
      ];
      
      for (const pattern of namePatterns) {
        const match = allText.match(pattern);
        if (match && match[1] && match[1].length > 3) {
          data.homeownerName = match[1].trim();
          break;
        }
      }
      
      const phoneMatch = allText.match(/(?:phone|tel|mobile|call)[:\s]*(\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/i);
      if (phoneMatch) data.phoneNumber = phoneMatch[1];
      
      const addressMatch = allText.match(/(?:address|location|site)[:\s]+([0-9]+(?:\s+[A-Za-z\s]+){2,})/i);
      if (addressMatch) data.address = addressMatch[1].trim();
      
      // Construction-specific extractions
      const contractValueMatch = allText.match(/(?:total|amount|cost|price)[:\s]*\$?([0-9,]+(?:\.[0-9]{2})?)/i);
      if (contractValueMatch) data.systemSize = `$${contractValueMatch[1]}`;
      
      const dateMatch = allText.match(/(?:date|signed)[:\s]*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4})/i);
      if (dateMatch) data.utility = `Date: ${dateMatch[1]}`;
      
      console.log('Extracted data:', data);
      
      setExtractedData(data);
      if (onExtractedDataAction) {
        onExtractedDataAction(data);
      }
      
      // Show success message if we got some data
      if (Object.keys(data).length > 0) {
        alert(`Successfully extracted ${Object.keys(data).length} data fields from the PDF!`);
      } else {
        alert('PDF text was extracted, but no recognizable data patterns were found. This might be a scanned document or use non-standard formatting.');
      }
      
    } catch (error) {
      console.error('Text extraction failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Text extraction failed: ${errorMessage}`);
      
      // Set a fallback message
      setExtractedData({
        utility: 'Extraction failed - try a different PDF viewer or check browser console for details'
      });
    } finally {
      setIsExtracting(false);
    }
  }, [fileUrl, loadPdfJs, onExtractedDataAction]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col z-50">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-white">{fileName}</h3>
          <span className="text-sm text-orange-400">Enhanced PDF Viewer (Fallback Mode)</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={extractTextFromDocument}
            disabled={isExtracting}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isExtracting ? 'Extracting...' : 'Extract Data'}
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Download
          </button>

          <button 
            onClick={onCloseAction} 
            className="p-2 text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1 flex items-center justify-center bg-gray-900">
          <div className="text-center max-w-lg">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-2xl font-medium text-white mb-4">Enhanced PDF Viewer (Fallback Mode)</h4>
            <p className="text-gray-400 mb-6 leading-relaxed">
              This is a fallback version of the Enhanced PDF Viewer. The react-pdf library can be installed 
              for advanced features like page-by-page navigation and enhanced text extraction.
              For now, this mode provides basic PDF functionality with direct PDF.js integration.
            </p>
            
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h5 className="text-white font-medium mb-3">Available Actions:</h5>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Extract text data using PDF.js</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Download PDF file</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span>Open in new browser tab</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleOpenNewTab}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Open PDF in New Tab
              </button>
              <button
                onClick={handleDownload}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Download PDF File
              </button>
              <button
                onClick={onCloseAction}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Close and Switch Viewers
              </button>
            </div>
          </div>
        </div>

        {/* Extraction Results Panel */}
        {Object.keys(extractedData).length > 0 && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-2">Extracted Data</h3>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="bg-gray-700 rounded-lg p-4">
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
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
