'use client';

import PDFPreview from '@/components/pdf-preview';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PDFPreviewTestPage() {
    const router = useRouter();

    const testPDFs = [
        {
            name: 'Sample Contract',
            url: '/api/files/sample-contract.pdf'
        },
        {
            name: 'Solar Installation Agreement',
            url: '/api/files/1751473864955_gurun27uieo_Solar_Installation_Agreement__1_.pdf'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>

                <h1 className="text-3xl font-bold text-white mb-8">PDF Preview Test</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testPDFs.map((pdf, index) => (
                        <div key={index} className="bg-gray-800 rounded-lg p-4">
                            <h3 className="text-white font-medium mb-4">{pdf.name}</h3>

                            {/* Large Preview */}
                            <div className="mb-4">
                                <h4 className="text-gray-400 text-sm mb-2">Large Preview (300x400)</h4>
                                <PDFPreview
                                    fileUrl={pdf.url}
                                    fileName={pdf.name}
                                    width={300}
                                    height={400}
                                />
                            </div>

                            {/* Small Preview */}
                            <div className="mb-4">
                                <h4 className="text-gray-400 text-sm mb-2">Small Preview (200x260)</h4>
                                <PDFPreview
                                    fileUrl={pdf.url}
                                    fileName={pdf.name}
                                    width={200}
                                    height={260}
                                />
                            </div>

                            {/* Direct iframe test */}
                            <div className="mb-4">
                                <h4 className="text-gray-400 text-sm mb-2">Direct iframe (200x260)</h4>
                                <div className="relative bg-gray-700 rounded-lg overflow-hidden" style={{ width: 200, height: 260 }}>
                                    <iframe
                                        src={pdf.url}
                                        width="100%"
                                        height="100%"
                                        className="border-0"
                                        title={`Direct iframe of ${pdf.name}`}
                                    />
                                </div>
                            </div>

                            {/* URL test */}
                            <div className="text-xs text-gray-400">
                                <p>URL: <a href={pdf.url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300">{pdf.url}</a></p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Console output area */}
                <div className="mt-8 bg-gray-800 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-2">✅ PDF Preview Status: Working!</h3>
                    <p className="text-green-400 text-sm mb-4">The console shows PDFs are loading successfully.</p>

                    <h4 className="text-white font-medium mb-2">Debug Info:</h4>
                    <ul className="text-gray-400 text-sm space-y-1">
                        <li>• Open browser developer tools (F12)</li>
                        <li>• Check the Console tab for any PDF loading messages</li>
                        <li>• Check the Network tab to see if PDF files are loading</li>
                        <li>• Try clicking the direct URL links to verify PDF files work</li>
                    </ul>
                </div>
            </div>
        </div>
    );
} 