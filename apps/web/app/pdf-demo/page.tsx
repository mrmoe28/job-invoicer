'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Import the PDF viewer dynamically to avoid SSR issues
const SecurePDFViewer = dynamic(() => import('../../components/pdf/secure-pdf-viewer'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg border">
            <div className="text-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse mx-auto mb-4"></div>
                <p className="text-gray-600">Loading PDF Viewer...</p>
            </div>
        </div>
    )
});

export default function PDFDemoPage() {
    const [selectedPdf, setSelectedPdf] = useState('/sample-contract.pdf');
    const [customUrl, setCustomUrl] = useState('');

    const samplePdfs = [
        { name: 'Sample Contract', url: '/sample-contract.pdf' },
        { name: 'External PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    ];

    const handlePdfChange = (url: string) => {
        setSelectedPdf(url);
    };

    const handleCustomUrl = () => {
        if (customUrl.trim()) {
            setSelectedPdf(customUrl.trim());
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF Viewer Demo</h1>
                    <p className="text-gray-600">Test the secure PDF viewer component with local and remote PDFs</p>
                </div>

                {/* PDF Selection Controls */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose a PDF to view:</h2>

                    <div className="space-y-4">
                        {/* Sample PDFs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {samplePdfs.map((pdf, index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePdfChange(pdf.url)}
                                    className={`p-4 border rounded-lg text-left transition-colors ${selectedPdf === pdf.url
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="font-medium">{pdf.name}</div>
                                    <div className="text-sm text-gray-500 mt-1">{pdf.url}</div>
                                </button>
                            ))}
                        </div>

                        {/* Custom URL Input */}
                        <div className="flex gap-2">
                            <input
                                type="url"
                                placeholder="Enter custom PDF URL..."
                                value={customUrl}
                                onChange={(e) => setCustomUrl(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                onClick={handleCustomUrl}
                                disabled={!customUrl.trim()}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Load PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* PDF Viewer */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">PDF Viewer</h3>
                        <p className="text-sm text-gray-500 mt-1">Currently viewing: {selectedPdf}</p>
                    </div>

                    <div className="p-4">
                        <SecurePDFViewer
                            fileUrl={selectedPdf}
                            height="800px"
                            showControls={true}
                            onLoadSuccess={(pdf) => {
                                console.log('PDF loaded successfully:', pdf);
                                alert(`PDF loaded successfully with ${pdf.numPages} pages!`);
                            }}
                            onLoadError={(error) => {
                                console.error('PDF loading error:', error);
                                alert(`Error loading PDF: ${error.message}`);
                            }}
                        />
                    </div>
                </div>

                {/* Usage Instructions */}
                <div className="mt-8 bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">How to use the PDF Viewer</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                        <div>
                            <h4 className="font-medium mb-2">Local PDFs:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Place PDF files in the <code className="bg-blue-100 px-1 rounded">/public</code> directory</li>
                                <li>Reference with absolute paths like <code className="bg-blue-100 px-1 rounded">/filename.pdf</code></li>
                                <li>Works great for contracts, documentation, etc.</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">Remote PDFs:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Use full URLs to PDFs hosted elsewhere</li>
                                <li>Great for S3, Supabase, or other cloud storage</li>
                                <li>Handles CORS automatically</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Component Usage Example */}
                <div className="mt-8 bg-gray-900 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Component Usage</h3>
                    <pre className="text-green-400 text-sm overflow-x-auto">
                        {`import SecurePDFViewer from './components/pdf/secure-pdf-viewer';

<SecurePDFViewer
  fileUrl="/contracts/sample-contract.pdf"
  height="600px"
  showControls={true}
  onLoadSuccess={(pdf) => console.log('PDF loaded:', pdf.numPages, 'pages')}
  onLoadError={(error) => console.error('Error:', error)}
/>`}
                    </pre>
                </div>
            </div>
        </div>
    );
} 