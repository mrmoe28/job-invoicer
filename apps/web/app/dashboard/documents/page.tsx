'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */

import { useState, useCallback, useRef, useEffect } from 'react';
import DashboardLayout from '../../../components/dashboard-layout';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Lazy-loaded PDF viewer (client only)
const LazyPdfViewer = dynamic(() => import('../../../components/pdf-viewer'), {
  ssr: false,
});

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [extractedPdfData, setExtractedPdfData] = useState<any>(null);
  const [editingDocument, setEditingDocument] = useState<any>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [editingCell, setEditingCell] = useState<{docId: string, field: string} | null>(null);
  const [editingValue, setEditingValue] = useState('');
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

  const initialDocuments: DocumentItem[] = [
    {
      id: 'demo-pdf-1',
      name: 'Sample Contract.pdf',
      type: 'Contract',
      status: 'approved',
      size: '2.4 MB',
      date: 'Dec 15, 2024',
      related: 'Johnson Project',
    },
    {
      id: 'demo-pdf-2',
      name: 'Project Proposal.pdf',
      type: 'Proposal',
      status: 'draft',
      size: '1.8 MB',
      date: 'Dec 12, 2024',
      related: 'Wilson Project',
    },
    {
      id: 'demo-img-1', 
      name: 'Site Photo.jpg',
      type: 'Photo',
      status: 'approved', 
      size: '1.8 MB',
      date: 'Dec 10, 2024',
      related: 'Smith Project',
    },
    {
      id: 'demo-csv-1',
      name: 'Material List.csv', 
      type: 'Spreadsheet',
      status: 'draft',
      size: '0.3 MB', 
      date: 'Dec 8, 2024',
      related: 'Wilson Project',
    }
  ];

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    if (typeof window === 'undefined') return initialDocuments;
    try {
      const stored = localStorage.getItem('documents');
      return stored ? JSON.parse(stored) : initialDocuments;
    } catch {
      return initialDocuments;
    }
  });

  // persist
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('documents', JSON.stringify(documents));
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
          
          if (fileType === 'pdf') {
            // Use advanced PDF viewer for PDF files
            setShowPdfViewer(true);
            setShowViewerModal(false); // Ensure other modal is closed
          } else {
            // Use simple modal for other file types
            setShowViewerModal(true);
            setShowPdfViewer(false); // Ensure PDF viewer is closed
            setZoomLevel(1);
            
            // Load CSV data if it's a CSV file
            if (document.name.toLowerCase().endsWith('.csv')) {
              loadCSVData(document);
            }
          }
        }
        break;
      case 'download':
        if (document) {
          // For uploaded files with blob URLs, download directly
          if (document.url && document.url.startsWith('blob:')) {
            const link = window.document.createElement('a');
            link.href = document.url;
            link.download = document.name;
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
          } else {
            // Simulate download for demo files
            const blob = new Blob(['Sample file content'], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const link = window.document.createElement('a');
            link.href = url;
            link.download = document.name;
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        }
        break;
      case 'edit':
        if (document) {
          setEditingDocument({ ...document });
          setShowEditModal(true);
        }
        break;
      case 'delete':
        if (document) {
          // Clean up blob URL if it exists
          if (document.url && document.url.startsWith('blob:')) {
            URL.revokeObjectURL(document.url);
          }
          
          // Actually remove the document from the list
          setDocuments(prev => prev.filter(doc => doc.id !== documentId));
          
          // Remove from selected documents if it was selected
          setSelectedDocuments(prev => prev.filter(id => id !== documentId));
        }
        break;
    }
  }, [documents, loadCSVData]);

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

  const handleUploadSubmit = useCallback(() => {
    if (uploadedFiles.length === 0) {
      return;
    }

    console.log('Uploading files:', uploadedFiles);
    
    // Actually add the uploaded files to the documents list
    const newDocuments = uploadedFiles.map((file, index) => ({
      id: `doc${Date.now()}_${index}`,
      name: file.name,
      type: 'Other', // Default type, user can change later
      status: 'draft',
      size: formatFileSize(file.size),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      related: 'N/A',
      // Use a blob URL so we can preview the exact uploaded file immediately
      url: URL.createObjectURL(file),
    }));

    // Add new documents to the existing list
    setDocuments(prev => [...prev, ...newDocuments]);
    
    setShowUploadModal(false);
    setUploadedFiles([]);
  }, [uploadedFiles]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCellEdit = useCallback((docId: string, field: string, currentValue: string) => {
    setEditingCell({ docId, field });
    setEditingValue(currentValue);
  }, []);

  const handleCellSave = useCallback((docId: string, field: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, [field]: editingValue } : doc
    ));
    setEditingCell(null);
    setEditingValue('');
  }, [editingValue]);

  const handleCellCancel = useCallback(() => {
    setEditingCell(null);
    setEditingValue('');
  }, []);

  const getFileType = (filename: string) => {
    const extension = filename.toLowerCase().split('.').pop();
    if (['pdf'].includes(extension || '')) return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image';
    if (['csv'].includes(extension || '')) return 'csv';
    return 'other';
  };

  const getFileUrl = (filename: string) => {
    // In a real app, this would return the actual file URL from your storage
    // For demo purposes, using reliable placeholder URLs
    const fileType = getFileType(filename);
    switch (fileType) {
      case 'pdf':
        // Using multiple fallback PDFs for better reliability
        const pdfUrls = [
          'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          'https://www.africau.edu/images/default/sample.pdf',
          'https://www.orimi.com/pdf-test.pdf'
        ];
        // Use filename hash to consistently return same PDF for same file
        const index = Math.abs(filename.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % pdfUrls.length;
        return pdfUrls[index];
      case 'image':
        // Use a more reliable image service
        const imageId = Math.abs(filename.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 1000;
        return `https://picsum.photos/800/600?random=${imageId}`;
      case 'csv':
        return '#'; // CSV data is handled separately
      default:
        return '#';
    }
  };

  const statusTabs = ['All', 'Drafts', 'Pending', 'Approved', 'Signed', 'Expired', 'Archived'];

  const renderDocumentViewer = () => {
    if (!currentDocument) return null;

    const fileType = getFileType(currentDocument.name);
    const fileUrl = currentDocument.url ?? getFileUrl(currentDocument.name);

    switch (fileType) {
      case 'pdf':
        return (
          <LazyPdfViewer
            fileUrl={fileUrl}
            fileName={currentDocument.name}
            onCloseAction={() => setShowViewerModal(false)}
            onExtractedDataAction={(data) => {
              setExtractedPdfData(data);
              console.log('Extracted PDF data:', data);
            }}
          />
        );
      
      case 'image':
        return (
          <div 
            className="w-full h-full flex items-center justify-center overflow-auto"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            ref={viewerRef}
          >
            <div
              style={{ 
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center',
                transition: isPinching ? 'none' : 'transform 0.2s ease',
              }}
            >
              <Image
                ref={imageRef as any}
                src={fileUrl}
                alt={currentDocument.name}
                width={800}
                height={600}
                unoptimized
                className="max-w-none"
              />
            </div>
          </div>
        );
      
      case 'csv':
        return (
          <div className="w-full h-full overflow-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">CSV Data Preview</h3>
              {csvData.length > 0 && (
                <div className="bg-gray-700 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-600">
                      <tr>
                        {csvData[0]?.map((header, index) => (
                          <th key={index} className="text-left p-3 text-white font-medium border-r border-gray-500 last:border-r-0">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(1).map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-t border-gray-600 hover:bg-gray-600">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="p-3 text-gray-300 border-r border-gray-600 last:border-r-0">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-white font-medium mb-2">Preview not available</p>
              <p className="text-gray-400">This file type is not supported for preview</p>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout title="Documents & Contracts">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <button 
              onClick={handleUploadDocument}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Document
            </button>
            <button 
              onClick={handleCreateDocument}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg font-medium border border-gray-600 transition-colors"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={handleDocumentSearch}
              className="w-64 pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <svg className="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg border border-gray-700">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleStatusFilter(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                statusFilter === tab 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* View Mode Buttons */}
        <div className="flex items-center space-x-2 mb-4">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}
            title="List view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}
            title="Grid view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>

        {/* Responsive Table Layout */}
        {viewMode === 'list' && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-visible min-h-[400px] pb-32 w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-400">
                  {documents.length} document{documents.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="relative">
                <button
                  onClick={handleColumnSettings}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  <span>Columns</span>
                </button>
                {showColumnSettings && (
                  <div className="absolute top-12 right-0 sm:left-1/2 sm:-translate-x-1/2 w-64 max-h-[70vh] overflow-y-auto bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-50">
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-white mb-3">Column Settings</h4>
                      <div className="space-y-2">
                        {columnSettings.map((column) => (
                          <div key={column.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={column.visible}
                                onChange={() => handleColumnToggle(column.id)}
                                className="rounded bg-gray-600 border-gray-500"
                              />
                              <span className="text-sm text-gray-300">{column.label}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleColumnReorder(column.id, 'up')}
                                disabled={column.order === 0}
                                className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                title={`Move ${column.label} up`}
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleColumnReorder(column.id, 'down')}
                                disabled={column.order === columnSettings.length - 1}
                                className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                title={`Move ${column.label} down`}
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="overflow-x-auto overflow-visible w-full">
              <table className="w-full min-w-max overflow-visible">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left p-4 text-gray-300 font-medium">
                      <input type="checkbox" className="rounded bg-gray-600 border-gray-500" aria-label="Select all documents" />
                    </th>
                    {getVisibleColumns().map((column) => (
                      <th key={column.id} className={`text-left p-4 text-gray-300 font-medium ${column.id === 'actions' ? 'text-center' : ''}`}>
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => {
                    const renderColumnContent = (columnId: string) => {
                      switch (columnId) {
                        case 'document':
                          return (
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div>
                                <div className="text-white font-medium">{doc.name}</div>
                                <div className="text-gray-400 text-sm">Uploaded file: {doc.name}</div>
                              </div>
                            </div>
                          );
                        case 'type':
                          return <span className="text-gray-300">{doc.type}</span>;
                        case 'status':
                          return (
                            <span className="bg-orange-500 text-white px-2 py-1 rounded text-sm">
                              {doc.status}
                            </span>
                          );
                        case 'size':
                          return <span className="text-gray-300">{doc.size}</span>;
                        case 'date':
                          return (
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-gray-300">{doc.date}</span>
                            </div>
                          );
                        case 'related':
                          return <span className="text-gray-300">{doc.related}</span>;
                        case 'actions':
                          return (
                            <div className="relative overflow-visible">
                              <button 
                                onClick={() => toggleDropdown(doc.id)}
                                className="text-gray-400 hover:text-white transition-colors p-1 rounded"
                                title="Document actions"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                              </button>
                              {activeDropdown === doc.id && (
                                <div 
                                  className={`absolute right-0 w-48 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-50 ${
                                    documents.length === 1 || documents.indexOf(doc) === 0
                                      ? 'top-8'
                                      : documents.indexOf(doc) >= documents.length - 2
                                        ? 'bottom-8'
                                        : 'top-8'
                                  }`}
                                >
                                  <div className="py-1">
                                    <button
                                      onClick={() => handleDocumentAction(doc.id, 'view')}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
                                    >
                                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                      View Document
                                    </button>
                                    <button
                                      onClick={() => handleDocumentAction(doc.id, 'download')}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
                                    >
                                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      Download
                                    </button>
                                    <button
                                      onClick={() => handleDocumentAction(doc.id, 'edit')}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
                                    >
                                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                      Edit Document
                                    </button>
                                    <div className="border-t border-gray-600 my-1"></div>
                                    <button
                                      onClick={() => handleDocumentAction(doc.id, 'delete')}
                                      className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white"
                                    >
                                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                      Delete Document
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        default:
                          return null;
                      }
                    };
                    return (
                      <tr key={doc.id} className="border-t border-gray-700 hover:bg-gray-700 overflow-visible">
                        <td className="p-4">
                          <input 
                            type="checkbox" 
                            onChange={(e) => handleSelectDocument(doc.id, e.target.checked)}
                            className="rounded bg-gray-600 border-gray-500"
                            aria-label={`Select document ${doc.name}`}
                          />
                        </td>
                        {getVisibleColumns().map((column) => (
                          <td key={column.id} className={`p-4 ${column.id === 'actions' ? 'text-center overflow-visible relative' : ''}`}>
                            {renderColumnContent(column.id)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-gray-700 rounded-xl p-5 shadow flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">{doc.name}</h4>
                  <div className="text-gray-300 text-sm mb-1">Type: {doc.type}</div>
                  <div className="text-gray-300 text-sm mb-1">Status: {doc.status}</div>
                  <div className="text-gray-300 text-sm mb-1">Size: {doc.size}</div>
                  <div className="text-gray-300 text-sm mb-1">Date: {doc.date}</div>
                  <div className="text-gray-300 text-sm mb-1">Related: {doc.related}</div>
                </div>
                <div className="flex items-center justify-end mt-4 space-x-2">
                  <button onClick={() => handleDocumentAction(doc.id, 'view')} className="text-blue-400 hover:text-blue-300" title="View document">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                  <button onClick={() => handleDocumentAction(doc.id, 'edit')} className="text-gray-400 hover:text-gray-300" title="Edit document">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleDocumentAction(doc.id, 'delete')} className="text-red-400 hover:text-red-300" title="Delete document">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PDF Viewer Modal */}
        {showPdfViewer && currentDocument && (
          <LazyPdfViewer
            fileUrl={currentDocument.url ?? getFileUrl(currentDocument.name)}
            fileName={currentDocument.name}
            onCloseAction={() => {
              setShowPdfViewer(false);
              setCurrentDocument(null);
            }}
            onExtractedDataAction={(data) => {
              setExtractedPdfData(data);
              console.log('Extracted PDF data:', data);
            }}
          />
        )}
        {showViewerModal && currentDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col z-50">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-white">{currentDocument.name}</h3>
                <span className="text-sm text-gray-400">{currentDocument.size}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Zoom Controls (for images and PDFs) */}
                {['image', 'pdf'].includes(getFileType(currentDocument.name)) && (
                  <>
                    <button
                      onClick={handleZoomOut}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="Zoom out"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h6" />
                      </svg>
                    </button>
                    <span className="text-sm text-gray-400 min-w-[3rem] text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      onClick={handleZoomIn}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="Zoom in"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h6m-3-3v6" />
                      </svg>
                    </button>
                    <button
                      onClick={handleZoomReset}
                      className="px-3 py-1 text-sm text-gray-400 hover:text-white border border-gray-600 rounded transition-colors"
                    >
                      Reset
                    </button>
                    <div className="w-px h-6 bg-gray-600 mx-2"></div>
                  </>
                )}
                
                {/* Download Button */}
                <button
                  onClick={() => handleDocumentAction(currentDocument.id, 'download')}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Download"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
                
                {/* Close Button */}
                <button
                  onClick={() => {
                    setShowViewerModal(false);
                    setCurrentDocument(null);
                    setZoomLevel(1);
                  }}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Close viewer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Viewer Content */}
            <div className="flex-1 bg-gray-900 overflow-hidden">
              {renderDocumentViewer()}
            </div>
            
            {/* Footer with file info */}
            <div className="bg-gray-800 border-t border-gray-700 p-2 text-center">
              <p className="text-sm text-gray-400">
                {getFileType(currentDocument.name).toUpperCase()} • {currentDocument.size} • 
                {getFileType(currentDocument.name) === 'image' && ' Pinch to zoom or use controls above'}
                {getFileType(currentDocument.name) === 'pdf' && ' Use zoom controls above to resize'}
                {getFileType(currentDocument.name) === 'csv' && ' Tabular data view'}
              </p>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Upload Documents</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Drag & Drop Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver 
                    ? 'border-orange-500 bg-orange-500 bg-opacity-10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium mb-2">
                      {isDragOver ? 'Drop files here' : 'Drag and drop files here'}
                    </p>
                    <p className="text-gray-400 text-sm mb-4">
                      PDF, DOC, DOCX, XLS, XLSX, CSV, JPG, PNG, GIF (Max 10MB each)
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Choose Files
                    </button>
                  </div>
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.gif"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Choose files to upload"
              />

              {/* Selected Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-white font-medium mb-4">Selected Files ({uploadedFiles.length})</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-white font-medium">{file.name}</div>
                            <div className="text-gray-400 text-sm">{formatFileSize(file.size)}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Remove file"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Type Selection */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Document Type</label>
                  <select 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500"
                    aria-label="Select document type"
                  >
                    <option value="Installation Plan">Installation Plan</option>
                    <option value="Site Survey">Site Survey</option>
                    <option value="Technical Document">Technical Document</option>
                    <option value="Permit">Permit</option>
                    <option value="Contract">Contract</option>
                    <option value="Photo">Photo</option>
                    <option value="Data Export">Data Export</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-6 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadSubmit}
                  disabled={uploadedFiles.length === 0}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  Upload {uploadedFiles.length > 0 ? `(${uploadedFiles.length})` : ''}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Document Modal */}
        {showEditModal && editingDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Edit Document</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Close edit modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Document Name</label>
                  <input
                    type="text"
                    value={editingDocument.name}
                    onChange={(e) => handleEditInputChange('name', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Document Type</label>
                  <select
                    value={editingDocument.type}
                    onChange={(e) => handleEditInputChange('type', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Installation Plan">Installation Plan</option>
                    <option value="Site Survey">Site Survey</option>
                    <option value="Technical Document">Technical Document</option>
                    <option value="Permit">Permit</option>
                    <option value="Contract">Contract</option>
                    <option value="Photo">Photo</option>
                    <option value="Data Export">Data Export</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={editingDocument.status}
                    onChange={(e) => handleEditInputChange('status', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="signed">Signed</option>
                    <option value="expired">Expired</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Related To</label>
                  <input
                    type="text"
                    value={editingDocument.related}
                    onChange={(e) => handleEditInputChange('related', e.target.value)}
                    placeholder="Project, Contact, or Job reference"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDocument}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Advanced PDF Viewer */}
        {showPdfViewer && currentDocument && (
          <LazyPdfViewer
            fileUrl={currentDocument.url ?? getFileUrl(currentDocument.name)}
            fileName={currentDocument.name}
            onCloseAction={() => setShowPdfViewer(false)}
            onExtractedDataAction={(data) => {
              setExtractedPdfData(data);
              console.log('Extracted PDF data:', data);
            }}
          />
        )}

        {/* Click outside to close dropdown */}
        {activeDropdown && (
          <div 
            className="fixed inset-0 z-0" 
            onClick={() => setActiveDropdown(null)}
          ></div>
        )}
        
        {/* Click outside to close column settings */}
        {showColumnSettings && (
          <div 
            className="fixed inset-0 z-0" 
            onClick={() => setShowColumnSettings(false)}
          ></div>
        )}
      </div>
    </DashboardLayout>
  );
}
