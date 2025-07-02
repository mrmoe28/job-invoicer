'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */

import { useState, useCallback, useRef, useEffect } from 'react';
import DashboardLayout from '../../../components/dashboard-layout';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Import our consolidated PDF viewer
const PDFViewer = dynamic(() => import('../../../components/pdf/pdf-viewer'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-8 h-8 bg-orange-500 rounded-full animate-pulse mx-auto mb-4"></div>
        <p className="text-gray-400">Loading PDF Viewer...</p>
      </div>
    </div>
  )
});

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [extractedPdfData, setExtractedPdfData] = useState<any>(null);
  const [editingDocument, setEditingDocument] = useState<any>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [editingCell, setEditingCell] = useState<{ docId: string, field: string } | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [columnSettings, setColumnSettings] = useState([
    { id: 'document', label: 'Document', visible: true, order: 0 },
    { id: 'type', label: 'Type', visible: true, order: 1 },
    { id: 'status', label: 'Status', visible: true, order: 2 },
    { id: 'size', label: 'Size', visible: true, order: 3 },
    { id: 'date', label: 'Date', visible: true, order: 4 },
    { id: 'related', label: 'Related', visible: true, order: 5 },
    { id: 'actions', label: 'Actions', visible: true, order: 6 }
  ]);
  const [viewMode, setViewMode] = useState('list');

  interface DocumentItem {
    id: string;
    name: string;
    type: string;
    status: string;
    size: string;
    date: string;
    related: string;
    url?: string;
  }

  const initialDocuments: DocumentItem[] = [];

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    if (typeof window === 'undefined') return initialDocuments;
    try {
      const stored = localStorage.getItem('user_documents');
      return stored ? JSON.parse(stored) : initialDocuments;
    } catch {
      return initialDocuments;
    }
  });

  // persist
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_documents', JSON.stringify(documents));
      localStorage.setItem('documentsViewMode', viewMode);
    }
  }, [documents, viewMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('documentsViewMode');
      if (saved) setViewMode(saved);
    }
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  // Touch/gesture handling for pinch zoom
  const [isPinching, setIsPinching] = useState(false);
  const [lastTouchDistance, setLastTouchDistance] = useState(0);

  // Document management handlers
  const handleUploadDocument = useCallback(() => {
    console.log("Opening file upload interface");
    setShowUploadModal(true);
    setUploadedFiles([]);
  }, []);

  const handleCreateDocument = useCallback(() => {
    console.log("Creating new document");
    // TODO: Implement document creation interface
    // Could include template selection for contracts, reports, etc.
  }, []);

  const handleDocumentSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    console.log("Searching documents:", e.target.value);
    // TODO: Implement document search functionality
    // Search by name, content, type, related entity
  }, []);

  const handleStatusFilter = useCallback((status: string) => {
    setStatusFilter(status);
    console.log("Filtering documents by status:", status);
    // TODO: Implement status-based filtering
  }, []);

  const loadCSVData = useCallback((document: any) => {
    // In a real application, this would fetch CSV data from the server
    // For now, we'll just set empty data
    setCsvData([]);
  }, []);

  const handleDocumentAction = useCallback((documentId: string, action: 'view' | 'download' | 'edit' | 'delete') => {
    console.log(`Document ${action}:`, documentId);
    setActiveDropdown(null); // Close dropdown after action

    const document = documents.find(doc => doc.id === documentId);

    switch (action) {
      case 'view':
        if (document) {
          setCurrentDocument(document);
          const fileType = getFileType(document.name);

          // Show PDF viewer for PDF files, otherwise use the smart modal viewer
          if (fileType === 'pdf') {
            setShowPdfViewer(true);
          } else {
            setShowViewerModal(true);
          }
          setZoomLevel(1);

          // Load CSV data if it's a CSV file
          if (document.name.toLowerCase().endsWith('.csv')) {
            loadCSVData(document);
          }
        }
        break;

      case 'download':
        if (document) {
          const url = getFileUrl(document.name);
          const link = window.document.createElement('a');
          link.href = url;
          link.download = document.name;
          window.document.body.appendChild(link);
          link.click();
          window.document.body.removeChild(link);
        }
        break;

      case 'edit':
        if (document) {
          setEditingDocument({ ...document });
          setShowEditModal(true);
        }
        break;

      case 'delete':
        if (document && confirm(`Are you sure you want to delete "${document.name}"?`)) {
          setDocuments(prev => prev.filter(doc => doc.id !== documentId));
          // TODO: Also delete the actual file from storage
        }
        break;
    }
  }, [documents]);

  const handleSaveDocument = useCallback(() => {
    if (!editingDocument) return;

    // Update the document in the list
    setDocuments(prev => prev.map(doc =>
      doc.id === editingDocument.id ? editingDocument : doc
    ));

    setShowEditModal(false);
    setEditingDocument(null);
  }, [editingDocument]);

  const handleEditInputChange = useCallback((field: string, value: string) => {
    setEditingDocument((prev: any) => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Column settings handlers
  const handleColumnSettings = useCallback(() => {
    setShowColumnSettings(!showColumnSettings);
  }, [showColumnSettings]);

  const handleColumnToggle = useCallback((columnId: string) => {
    setColumnSettings(prev => prev.map(col =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  }, []);

  const handleColumnReorder = useCallback((columnId: string, direction: 'up' | 'down') => {
    setColumnSettings(prev => {
      const columns = [...prev];
      const currentIndex = columns.findIndex(col => col.id === columnId);
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (newIndex >= 0 && newIndex < columns.length) {
        // Swap the orders
        const temp = columns[currentIndex].order;
        columns[currentIndex].order = columns[newIndex].order;
        columns[newIndex].order = temp;

        // Sort by order
        return columns.sort((a, b) => a.order - b.order);
      }
      return columns;
    });
  }, []);

  const getVisibleColumns = useCallback(() => {
    return columnSettings.filter(col => col.visible).sort((a, b) => a.order - b.order);
  }, [columnSettings]);

  const handleSelectDocument = useCallback((docId: string, checked: boolean) => {
    if (checked) {
      setSelectedDocuments(prev => [...prev, docId]);
    } else {
      setSelectedDocuments(prev => prev.filter(id => id !== docId));
    }
  }, []);

  const toggleDropdown = useCallback((docId: string) => {
    setActiveDropdown(activeDropdown === docId ? null : docId);
  }, [activeDropdown]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.25));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(1);
  }, []);

  // Touch event handlers for pinch zoom
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setIsPinching(true);
      setLastTouchDistance(getTouchDistance(e.touches));
      e.preventDefault();
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isPinching && e.touches.length === 2) {
      const currentDistance = getTouchDistance(e.touches);
      const scaleFactor = currentDistance / lastTouchDistance;

      setZoomLevel(prev => Math.max(0.25, Math.min(3, prev * scaleFactor)));
      setLastTouchDistance(currentDistance);
      e.preventDefault();
    }
  }, [isPinching, lastTouchDistance]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      setIsPinching(false);
    }
  }, []);

  // File upload handlers
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles(prev => [...prev, ...files]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleUploadSubmit = useCallback(async () => {
    if (uploadedFiles.length === 0) {
      console.warn('No files selected for upload');
      return;
    }

    console.log('Uploading files:', uploadedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Validate files before upload
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'csv', 'txt', 'doc', 'docx', 'xls', 'xlsx'];

      for (const file of uploadedFiles) {
        if (file.size === 0) {
          throw new Error(`File "${file.name}" is empty`);
        }
        if (file.size > maxSize) {
          throw new Error(`File "${file.name}" is too large (max 10MB)`);
        }
        const extension = file.name.toLowerCase().split('.').pop() || '';
        if (!allowedExtensions.includes(extension)) {
          throw new Error(`File "${file.name}" has unsupported extension ".${extension}"`);
        }
      }

      // Create FormData for file upload
      const formData = new FormData();
      uploadedFiles.forEach(file => {
        formData.append('files', file);
      });

      console.log('📤 Sending upload request...');

      // Simulate progress for user feedback
      setUploadProgress(25);

      // Upload files to the API
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(75);

      console.log('📥 Upload response:', response.status, response.statusText);

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response JSON:', parseError);
        throw new Error(`Server returned invalid response (${response.status})`);
      }

      if (!response.ok) {
        throw new Error(result.error || `Upload failed: ${response.statusText}`);
      }

      // Handle both single file and multiple files response
      const files = result.files || (result.file ? [result.file] : []);

      if (result.success && files.length > 0) {
        // Create document entries for uploaded files
        const newDocuments = files.map((fileData: any) => ({
          id: fileData.id,
          name: fileData.originalName,
          type: getDocumentType(fileData.originalName),
          status: 'draft',
          size: formatFileSize(fileData.size),
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          related: 'N/A',
          // Use API endpoint for file serving
          url: fileData.url,
          fileName: fileData.filename, // Store the server filename for API calls
        }));

        // Add new documents to the existing list
        setDocuments(prev => [...prev, ...newDocuments]);

        setUploadProgress(100);

        // Brief delay to show 100% progress
        setTimeout(() => {
          setShowUploadModal(false);
          setUploadedFiles([]);
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);

        console.log('✅ Files uploaded successfully:', newDocuments.length, 'files');
      } else {
        throw new Error(result.error || 'Upload failed - no files returned');
      }

    } catch (error) {
      console.error('❌ Upload error:', error);

      // Show detailed error to user
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setUploadError(errorMessage);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [uploadedFiles]);

  const getDocumentType = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const typeMap: { [key: string]: string } = {
      'pdf': 'PDF Document',
      'doc': 'Word Document',
      'docx': 'Word Document',
      'xls': 'Excel Spreadsheet',
      'xlsx': 'Excel Spreadsheet',
      'ppt': 'PowerPoint Presentation',
      'pptx': 'PowerPoint Presentation',
      'txt': 'Text Document',
      'csv': 'CSV File',
      'jpg': 'Image',
      'jpeg': 'Image',
      'png': 'Image',
      'gif': 'Image',
      'zip': 'Archive',
      'rar': 'Archive'
    };
    return typeMap[extension || ''] || 'Unknown';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileType = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) {
      return 'image';
    } else if (['pdf'].includes(extension || '')) {
      return 'pdf';
    } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension || '')) {
      return 'video';
    } else if (['mp3', 'wav', 'ogg', 'aac'].includes(extension || '')) {
      return 'audio';
    } else if (['txt', 'csv', 'json', 'xml', 'log'].includes(extension || '')) {
      return 'text';
    } else if (['doc', 'docx', 'pdf', 'ppt', 'pptx', 'xls', 'xlsx'].includes(extension || '')) {
      return 'document';
    }
    return 'unknown';
  };

  const getFileUrl = (filename: string) => {
    // In a real application, this would return the actual file URL
    // For demo purposes, we'll return a placeholder or sample file
    const fileType = getFileType(filename);

    if (fileType === 'pdf') {
      return '/sample-document.pdf'; // You should have a sample PDF in your public folder
    } else if (fileType === 'image') {
      return '/placeholder-image.jpg';
    }

    return '#'; // Fallback for other file types
  };

  const renderDocumentViewer = () => {
    if (!currentDocument) return null;

    const fileType = getFileType(currentDocument.name);
    const fileUrl = getFileUrl(currentDocument.name);

    if (fileType === 'image') {
      return (
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">{currentDocument.name}</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.1, prev - 0.1))}
                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
              >
                -
              </button>
              <span className="text-white">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.1))}
                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
              >
                +
              </button>
              <button
                onClick={() => setShowViewerModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 bg-gray-900">
            <div className="flex justify-center">
              <Image
                ref={imageRef}
                src={fileUrl}
                alt={currentDocument.name}
                width={800}
                height={600}
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center',
                  maxWidth: 'none'
                }}
                className="border border-gray-600"
              />
            </div>
          </div>
        </div>
      );
    }

    if (fileType === 'text' || currentDocument.name.toLowerCase().endsWith('.csv')) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">{currentDocument.name}</h3>
            <button
              onClick={() => setShowViewerModal(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 bg-gray-900">
            {currentDocument.name.toLowerCase().endsWith('.csv') ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-white">
                  <tbody>
                    {csvData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-gray-700">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-2 border-r border-gray-700">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <pre className="text-white font-mono text-sm whitespace-pre-wrap">
                {/* Text content would be loaded here */}
                Loading text content...
              </pre>
            )}
          </div>
        </div>
      );
    }

    // For other file types, show a generic viewer
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">{currentDocument.name}</h3>
          <button
            onClick={() => setShowViewerModal(false)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-white mb-2">{currentDocument.name}</p>
            <p className="text-gray-400 mb-4">Preview not available for this file type</p>
            <button
              onClick={() => handleDocumentAction(currentDocument.id, 'download')}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Download File
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout
      title="Documents"
      subtitle="Manage your project documents, contracts, and files"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleUploadDocument}
              className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Documents
            </button>
            <button
              onClick={handleCreateDocument}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Document
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={handleDocumentSearch}
                className="pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Document List */}
        <div className="bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6">
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-300">No documents</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by uploading your first document.</p>
              <div className="mt-6">
                <button
                  onClick={handleUploadDocument}
                  className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Documents
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {showPdfViewer && currentDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
          <div className="w-full h-full max-w-6xl mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">{currentDocument.name}</h3>
              <button
                onClick={() => setShowPdfViewer(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
            <div className="h-full bg-white rounded-lg overflow-hidden">
              <PDFViewer
                file={getFileUrl(currentDocument.name)}
                className="h-full"
                enableFullscreen={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Smart Document Viewer Modal */}
      {showViewerModal && currentDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
          <div className="w-full h-full max-w-6xl mx-auto p-4">
            <div className="h-full bg-gray-800 rounded-lg overflow-hidden">
              {renderDocumentViewer()}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
