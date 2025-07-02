'use client';

import { useState } from 'react';
import UniversalDocumentViewer from '../../components/pdf/universal-document-viewer';

export default function PDFTestPage() {
    const [selectedFile, setSelectedFile] = useState('1751473864955_gurun27uieo_Solar_Installation_Agreement__1_.pdf');

    // Available solar installation agreement files from uploads directory
    const availableFiles = [
        '1751473864955_gurun27uieo_Solar_Installation_Agreement__1_.pdf',
        '1751473896234_7rer9sjxfub_Solar_Installation_Agreement__1_.pdf',
        '1751473923491_2c8wv5gooow_Solar_Installation_Agreement__1_.pdf',
        '1751473974284_e25yjzxayi_Solar_Installation_Agreement__1_.pdf',
        '1751473985146_wk3w52pyuo_Solar_Installation_Agreement__1_.pdf',
        'sample-contract.pdf'
    ];

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white mb-4">PDF Viewer Test</h1>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {availableFiles.map((file) => (
                            <button
                                key={file}
                                onClick={() => setSelectedFile(file)}
                                className={`px-3 py-2 rounded-lg text-sm transition-colors ${selectedFile === file
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                {file.includes('Solar') ? 'Solar Agreement' : 'Sample Contract'}
                            </button>
                        ))}
                    </div>
                    <p className="text-gray-400 text-sm">
                        Testing PDF viewing with actual uploaded files. Current file: {selectedFile}
                    </p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                    <UniversalDocumentViewer
                        fileUrl={`/api/files/${selectedFile}`}
                        fileName={selectedFile}
                        height="800px"
                        showControls={true}
                        onLoadSuccess={(document) => {
                            console.log('PDF loaded successfully:', document);
                        }}
                        onLoadError={(error) => {
                            console.error('PDF load error:', error);
                        }}
                    />
                </div>
            </div>
        </div>
    );
} 