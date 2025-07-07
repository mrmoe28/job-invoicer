'use client';

import { CheckCircle, Download, Eye, FileText, Upload, FileSignature, Share2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import EnhancedFileUpload from './enhanced-file-upload';
import PDFPreview from './pdf-preview';
import EnhancedDocumentViewer from './enhanced-document-viewer';

interface SolarDocument {
    id: string;
    name: string;
    filename: string; // Actual stored filename
    size: string;
    uploadedAt: string;
    url: string;
    status: 'uploaded' | 'processing' | 'ready' | 'signed';
    signatures?: {
        id: string;
        signerName: string;
        signerEmail: string;
        status: string;
        signedAt?: string;
    }[];
}

export default function EnhancedSolarDocumentManager() {
    const [documents, setDocuments] = useState<SolarDocument[]>([]);
    const [selectedDocument, setSelectedDocument] = useState<SolarDocument | null>(null);
    const [showUpload, setShowUpload] = useState(false);
    const [showViewer, setShowViewer] = useState(false);

    const handleUploadComplete = useCallback((uploadResults: any[]) => {
        console.log('Solar document upload completed:', uploadResults);

        const newDocuments = uploadResults
            .filter(result => result.success && result.file)
            .map(result => {
                const file = result.file;
                return {
                    id: file.id,
                    name: file.originalName,
                    filename: file.filename,
                    size: formatFileSize(file.size),
                    uploadedAt: new Date().toLocaleString(),
                    url: file.url,
                    status: 'ready' as const
                };
            });

        setDocuments(prev => [...newDocuments, ...prev]);
        setShowUpload(false);

        if (newDocuments.length > 0) {
            alert(`Successfully uploaded ${newDocuments.length} Solar Installation Agreement(s)!`);
        }
    }, []);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleViewDocument = (document: SolarDocument) => {
        setSelectedDocument(document);
        setShowViewer(true);
    };

    const handleDownloadDocument = (document: SolarDocument) => {
        const link = window.document.createElement('a');
        link.href = document.url;
        link.download = document.name;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
    };

    const handleDocumentUpdated = (documentId: string, newStatus: 'signed') => {
        setDocuments(prev => 
            prev.map(doc => 
                doc.id === documentId 
                    ? { ...doc, status: newStatus } 
                    : doc
            )
        );
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Solar Installation Agreement Manager</h1>
                <p className="text-gray-400">
                    Upload, sign, and manage your Solar Installation Agreement PDFs with secure e-signature capabilities.
                </p>
            </div>

            {/* Upload Section */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Upload Documents</h2>
                    <button
                        onClick={() => setShowUpload(!showUpload)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Upload className="w-4 h-4" />
                        {showUpload ? 'Hide Upload' : 'Upload PDF'}
                    </button>
                </div>

                {showUpload && (
                    <div className="border border-gray-700 rounded-lg p-4">
                        <EnhancedFileUpload
                            onUploadComplete={handleUploadComplete}
                            maxFiles={5}
                            className="mb-4"
                        />
                        <div className="text-sm text-gray-400">
                            <p className="mb-2">📋 <strong>Supported formats:</strong> PDF files up to 10MB each</p>
                            <p className="mb-2">🔒 <strong>Security:</strong> All uploads are processed securely</p>
                            <p>✅ <strong>Best for:</strong> Solar Installation Agreements, Contracts, Permits</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Documents List */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">
                    Uploaded Documents ({documents.length})
                </h2>

                {documents.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-300 mb-2">No documents uploaded yet</h3>
                        <p className="text-gray-400 mb-6">
                            Upload your first Solar Installation Agreement to get started
                        </p>
                        <button
                            onClick={() => setShowUpload(true)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg"
                        >
                            Upload Your First Document
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {documents.map((doc) => (
                            <div key={doc.id} className="bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-650 transition-colors">
                                {/* PDF Preview Section */}
                                <div className="relative">
                                    <PDFPreview
                                        fileUrl={doc.url}
                                        fileName={doc.name}
                                        width={300}
                                        height={200}
                                        className="w-full"
                                    />
                                    {/* Status Badge Overlay */}
                                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-black bg-opacity-70 rounded-full px-2 py-1">
                                        {doc.status === 'signed' ? (
                                            <>
                                                <FileSignature className="w-3 h-3 text-green-400" />
                                                <span className="text-xs text-green-400">Signed</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-3 h-3 text-green-400" />
                                                <span className="text-xs text-green-400">Ready</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Document Info Section */}
                                <div className="p-4">
                                    <h3 className="font-medium text-white mb-2 truncate" title={doc.name}>
                                        {doc.name}
                                    </h3>

                                    <div className="text-sm text-gray-400 mb-4 space-y-1">
                                        <div>Size: {doc.size}</div>
                                        <div>Uploaded: {doc.uploadedAt}</div>
                                        {doc.status === 'signed' && (
                                            <div className="text-green-400">Signed document</div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleViewDocument(doc)}
                                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1 transition-colors"
                                        >
                                            {doc.status === 'signed' ? (
                                                <>
                                                    <FileSignature className="w-4 h-4" />
                                                    View Signed
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="w-4 h-4" />
                                                    View & Sign
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDownloadDocument(doc)}
                                            className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-3 rounded-lg text-sm flex items-center justify-center transition-colors"
                                            title="Download PDF"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Document Viewer Modal */}
            {showViewer && selectedDocument && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-lg w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
                        <EnhancedDocumentViewer
                            document={{
                                id: selectedDocument.id,
                                name: selectedDocument.name,
                                url: selectedDocument.url,
                                status: selectedDocument.status
                            }}
                            onClose={() => {
                                setShowViewer(false);
                                setSelectedDocument(null);
                            }}
                            height="100%"
                        />
                    </div>
                </div>
            )}

            {/* Features Section */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-white mb-6">Advanced E-Signature Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-700 p-5 rounded-lg">
                        <div className="mb-4 w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                            <FileSignature className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">Electronic Signatures</h3>
                        <p className="text-gray-400">
                            Sign documents electronically with our secure signature system. Draw or type your signature and place it on the document.
                        </p>
                    </div>
                    
                    <div className="bg-gray-700 p-5 rounded-lg">
                        <div className="mb-4 w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                            <Share2 className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">Request Signatures</h3>
                        <p className="text-gray-400">
                            Request signatures from clients and partners by email. They'll receive a secure link to sign documents online.
                        </p>
                    </div>
                    
                    <div className="bg-gray-700 p-5 rounded-lg">
                        <div className="mb-4 w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">Signature Verification</h3>
                        <p className="text-gray-400">
                            All signatures are verified and timestamped. Download signed documents with a complete audit trail.
                        </p>
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">How to Use E-Signatures</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                        <div>
                            <h3 className="font-medium text-white mb-1">Upload Document</h3>
                            <p className="text-gray-400">
                                Upload your Solar Installation Agreement or contract PDF file.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                        <div>
                            <h3 className="font-medium text-white mb-1">Sign Document</h3>
                            <p className="text-gray-400">
                                Open the document viewer and click "Sign Document" to add your signature.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                        <div>
                            <h3 className="font-medium text-white mb-1">Request Signatures</h3>
                            <p className="text-gray-400">
                                Send the document to clients or partners to request their signatures via email.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
                        <div>
                            <h3 className="font-medium text-white mb-1">Download & Share</h3>
                            <p className="text-gray-400">
                                Once all signatures are complete, download the final signed document for your records.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
