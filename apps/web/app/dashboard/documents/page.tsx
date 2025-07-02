'use client';

import { Download, Eye, File, Grid, List, Lock, Plus, Search, Shield, Trash2, Upload } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import { getSecurityPresetForDocument } from '../../../lib/security-presets';

// Import enhanced PDF components
const EnhancedPDFUpload = dynamic(() => import('../../../components/pdf/enhanced-pdf-upload'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>
});

const SecurePDFViewer = dynamic(() => import('../../../components/pdf/secure-pdf-viewer'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>
});

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  status: string;
  size: string;
  date: string;
  related: string;
  url?: string;
  fileName?: string;
  tags?: string[];
  pages?: number;
  lastViewed?: string;
  securityLevel?: 'public' | 'restricted' | 'confidential';
  accessCount?: number;
}

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<DocumentItem | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Sample PDF documents with enhanced metadata and security levels
  const initialDocuments: DocumentItem[] = [
    {
      id: '1',
      name: 'Construction Contract - Phase 1.pdf',
      type: 'Contract',
      status: 'Active',
      size: '2.4 MB',
      date: '2024-07-01',
      related: 'Project Alpha',
      url: '/api/files/sample-contract.pdf',
      tags: ['contract', 'phase-1', 'legal'],
      pages: 12,
      lastViewed: '2024-07-02',
      securityLevel: 'restricted',
      accessCount: 8
    },
    {
      id: '2',
      name: 'Building Permit Application.pdf',
      type: 'Permit',
      status: 'Pending',
      size: '1.8 MB',
      date: '2024-06-28',
      related: 'City Hall',
      url: '/api/files/sample-contract.pdf',
      tags: ['permit', 'legal', 'application'],
      pages: 8,
      lastViewed: null,
      securityLevel: 'public',
      accessCount: 3
    },
    {
      id: '3',
      name: 'Confidential Safety Report.pdf',
      type: 'Report',
      status: 'Reviewed',
      size: '3.2 MB',
      date: '2024-06-25',
      related: 'Safety Team',
      url: '/api/files/sample-contract.pdf',
      tags: ['safety', 'compliance', 'confidential'],
      pages: 18,
      lastViewed: '2024-06-30',
      securityLevel: 'confidential',
      accessCount: 2
    },
    {
      id: '4',
      name: 'Internal Company Policy.pdf',
      type: 'Policy',
      status: 'Active',
      size: '1.2 MB',
      date: '2024-06-20',
      related: 'HR Department',
      url: '/api/files/sample-contract.pdf',
      tags: ['policy', 'internal', 'hr'],
      pages: 6,
      lastViewed: '2024-07-01',
      securityLevel: 'restricted',
      accessCount: 15
    },
    {
      id: '5',
      name: 'Public Project Specifications.pdf',
      type: 'Specifications',
      status: 'Published',
      size: '4.1 MB',
      date: '2024-06-15',
      related: 'Public Works',
      url: '/api/files/sample-contract.pdf',
      tags: ['public', 'specifications', 'project'],
      pages: 24,
      lastViewed: '2024-06-28',
      securityLevel: 'public',
      accessCount: 45
    }
  ];

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    if (typeof window === 'undefined') return initialDocuments;
    try {
      const stored = localStorage.getItem('constructflow_documents');
      return stored ? JSON.parse(stored) : initialDocuments;
    } catch {
      return initialDocuments;
    }
  });

  // Persist documents to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('constructflow_documents', JSON.stringify(documents));
    }
  }, [documents]);

  // Filter and sort documents
  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        doc.related.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || doc.status === statusFilter;
      const matchesType = typeFilter === 'All' || doc.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'size':
          aVal = parseFloat(a.size.replace(/[^\d.]/g, ''));
          bVal = parseFloat(b.size.replace(/[^\d.]/g, ''));
          break;
        case 'type':
          aVal = a.type;
          bVal = b.type;
          break;
        case 'date':
        default:
          aVal = new Date(a.date).getTime();
          bVal = new Date(b.date).getTime();
          break;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  // Get unique values for filters
  const uniqueStatuses = [...new Set(documents.map(doc => doc.status))];
  const uniqueTypes = [...new Set(documents.map(doc => doc.type))];

  // Handle document upload completion with security assignment
  const handleUploadComplete = useCallback((uploadedFiles: any[]) => {
    const newDocuments = uploadedFiles.map((file) => {
      const docType = getDocumentType(file.name);
      const securityConfig = getSecurityPresetForDocument(docType, file.name);

      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: docType,
        status: 'Active',
        size: formatFileSize(file.size || 0),
        date: new Date().toISOString().split('T')[0],
        related: 'New Upload',
        url: file.uploadedUrl || file.url,
        fileName: file.fileName,
        tags: ['new', 'uploaded'],
        pages: Math.floor(Math.random() * 20) + 1, // In real app, extract from PDF
        lastViewed: null,
        securityLevel: securityConfig.accessLevel,
        accessCount: 0
      };
    });

    setDocuments(prev => [...newDocuments, ...prev]);
    setShowUploadModal(false);
  }, []);

  // Document actions with security integration
  const handleDocumentAction = useCallback((documentId: string, action: 'view' | 'download' | 'edit' | 'delete') => {
    const document = documents.find(doc => doc.id === documentId);
    if (!document) return;

    switch (action) {
      case 'view':
        setCurrentDocument(document);
        setShowPdfViewer(true);
        // Update last viewed and access count
        setDocuments(prev => prev.map(doc =>
          doc.id === documentId
            ? {
              ...doc,
              lastViewed: new Date().toISOString().split('T')[0],
              accessCount: (doc.accessCount || 0) + 1
            }
            : doc
        ));
        break;

      case 'download':
        // Check if document allows downloads based on security level
        const securityConfig = getSecurityPresetForDocument(document.type, document.name);
        if (!securityConfig.allowDownload && document.securityLevel !== 'public') {
          alert('Download is not permitted for this document due to security restrictions.');
          return;
        }

        if (document.url) {
          const link = window.document.createElement('a');
          link.href = document.url;
          link.download = document.name;
          window.document.body.appendChild(link);
          link.click();
          window.document.body.removeChild(link);
        }
        break;

      case 'delete':
        if (confirm(`Are you sure you want to delete "${document.name}"?`)) {
          setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        }
        break;
    }
  }, [documents]);

  // Bulk actions
  const handleBulkDelete = useCallback(() => {
    if (selectedDocuments.length === 0) return;

    const count = selectedDocuments.length;
    if (confirm(`Are you sure you want to delete ${count} document${count > 1 ? 's' : ''}?`)) {
      setDocuments(prev => prev.filter(doc => !selectedDocuments.includes(doc.id)));
      setSelectedDocuments([]);
    }
  }, [selectedDocuments]);

  const handleSelectDocument = useCallback((docId: string, checked: boolean) => {
    if (checked) {
      setSelectedDocuments(prev => [...prev, docId]);
    } else {
      setSelectedDocuments(prev => prev.filter(id => id !== docId));
    }
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedDocuments(filteredDocuments.map(doc => doc.id));
    } else {
      setSelectedDocuments([]);
    }
  }, [filteredDocuments]);

  // Utility functions
  const getDocumentType = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const typeMap: { [key: string]: string } = {
      'pdf': 'PDF Document',
      'doc': 'Word Document',
      'docx': 'Word Document',
      'xls': 'Spreadsheet',
      'xlsx': 'Spreadsheet',
      'ppt': 'Presentation',
      'pptx': 'Presentation',
      'txt': 'Text File',
      'csv': 'CSV File',
      'jpg': 'Image',
      'jpeg': 'Image',
      'png': 'Image',
      'gif': 'Image'
    };
    return typeMap[extension || ''] || 'Document';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-900 text-green-300';
      case 'pending': return 'bg-yellow-900 text-yellow-300';
      case 'reviewed': return 'bg-blue-900 text-blue-300';
      case 'expired': return 'bg-red-900 text-red-300';
      default: return 'bg-gray-900 text-gray-300';
    }
  };

  const getFileIcon = (type: string) => {
    return <File className="w-8 h-8 text-red-400" />;
  };

  // Security badge helpers
  const getSecurityBadge = (securityLevel?: string) => {
    switch (securityLevel) {
      case 'confidential':
        return {
          icon: <Lock className="w-3 h-3" />,
          color: 'bg-red-900 text-red-300 border border-red-700',
          label: 'Confidential'
        };
      case 'restricted':
        return {
          icon: <Shield className="w-3 h-3" />,
          color: 'bg-yellow-900 text-yellow-300 border border-yellow-700',
          label: 'Restricted'
        };
      case 'public':
      default:
        return {
          icon: <Eye className="w-3 h-3" />,
          color: 'bg-green-900 text-green-300 border border-green-700',
          label: 'Public'
        };
    }
  };

  const getSecurityIcon = (securityLevel?: string) => {
    switch (securityLevel) {
      case 'confidential':
        return <Lock className="w-4 h-4 text-red-400" />;
      case 'restricted':
        return <Shield className="w-4 h-4 text-yellow-400" />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title="PDF Document Manager"
      subtitle="Upload, view, and manage your PDF documents, contracts, and reports"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload PDFs
            </button>

            <button className="inline-flex items-center px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
              <Plus className="w-5 h-5 mr-2" />
              Create Document
            </button>

            {selectedDocuments.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Delete Selected ({selectedDocuments.length})
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent min-w-80"
              />
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-800 rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 text-white"
            >
              <option value="All">All Status</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 text-white"
            >
              <option value="All">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 text-white"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size</option>
              <option value="type">Sort by Type</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 text-white"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">View:</span>
            <div className="flex rounded-lg border border-gray-600 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Documents Display */}
        {filteredDocuments.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {documents.length === 0 ? 'No documents yet' : 'No documents match your filters'}
            </h3>
            <p className="text-gray-500 mb-6">
              {documents.length === 0
                ? 'Upload your first PDF to get started with document management'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {documents.length === 0 && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Upload Your First PDF
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>
                Showing {filteredDocuments.length} of {documents.length} documents
              </span>
              {filteredDocuments.length > 0 && (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-600 text-orange-500 focus:ring-orange-500"
                  />
                  Select All
                </label>
              )}
            </div>

            {/* Grid View */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDocuments.map((doc) => {
                  const securityBadge = getSecurityBadge(doc.securityLevel);
                  const securityIcon = getSecurityIcon(doc.securityLevel);

                  return (
                    <div key={doc.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <input
                          type="checkbox"
                          checked={selectedDocuments.includes(doc.id)}
                          onChange={(e) => handleSelectDocument(doc.id, e.target.checked)}
                          className="rounded border-gray-600 text-orange-500 focus:ring-orange-500"
                        />
                        <div className="flex items-center gap-2">
                          {/* Security Badge */}
                          <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${securityBadge.color}`}>
                            {securityBadge.icon}
                            {securityBadge.label}
                          </span>
                          {/* Status Badge */}
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(doc.status)}`}>
                            {doc.status}
                          </span>
                        </div>
                      </div>

                      <div className="aspect-[3/4] bg-gray-700 rounded-lg mb-4 flex items-center justify-center relative">
                        {getFileIcon(doc.type)}
                        {securityIcon && (
                          <div className="absolute top-2 right-2">
                            {securityIcon}
                          </div>
                        )}
                        {doc.accessCount && doc.accessCount > 0 && (
                          <div className="absolute bottom-2 left-2">
                            <span className="text-xs bg-gray-900 text-gray-300 px-2 py-1 rounded">
                              {doc.accessCount} views
                            </span>
                          </div>
                        )}
                      </div>

                      <h3 className="font-semibold text-white mb-2 truncate" title={doc.name}>
                        {doc.name}
                      </h3>

                      <div className="text-sm text-gray-400 mb-3 space-y-1">
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span>{doc.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span>{doc.size}</span>
                        </div>
                        {doc.pages && (
                          <div className="flex justify-between">
                            <span>Pages:</span>
                            <span>{doc.pages}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Date:</span>
                          <span>{doc.date}</span>
                        </div>
                        {doc.lastViewed && (
                          <div className="flex justify-between">
                            <span>Last viewed:</span>
                            <span>{doc.lastViewed}</span>
                          </div>
                        )}
                      </div>

                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {doc.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                              #{tag}
                            </span>
                          ))}
                          {doc.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                              +{doc.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDocumentAction(doc.id, 'view')}
                          className="flex-1 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors flex items-center justify-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => handleDocumentAction(doc.id, 'download')}
                          className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                          title={doc.securityLevel === 'confidential' ? 'Download restricted' : 'Download'}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDocumentAction(doc.id, 'delete')}
                          className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="text-left p-4 w-12">
                          <input
                            type="checkbox"
                            checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="rounded border-gray-600 text-orange-500 focus:ring-orange-500"
                          />
                        </th>
                        <th className="text-left p-4 font-medium">Document</th>
                        <th className="text-left p-4 font-medium">Type</th>
                        <th className="text-left p-4 font-medium">Size</th>
                        <th className="text-left p-4 font-medium">Pages</th>
                        <th className="text-left p-4 font-medium">Date</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocuments.map((doc) => (
                        <tr key={doc.id} className="border-t border-gray-700 hover:bg-gray-750">
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={selectedDocuments.includes(doc.id)}
                              onChange={(e) => handleSelectDocument(doc.id, e.target.checked)}
                              className="rounded border-gray-600 text-orange-500 focus:ring-orange-500"
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center">
                              {getFileIcon(doc.type)}
                              <div className="ml-3">
                                <div className="font-medium text-white">{doc.name}</div>
                                <div className="text-sm text-gray-400">
                                  Related to: {doc.related}
                                </div>
                                {doc.tags && doc.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {doc.tags.slice(0, 3).map((tag) => (
                                      <span key={tag} className="px-1 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-gray-300">{doc.type}</td>
                          <td className="p-4 text-gray-300">{doc.size}</td>
                          <td className="p-4 text-gray-300">{doc.pages || '--'}</td>
                          <td className="p-4 text-gray-300">{doc.date}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(doc.status)}`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDocumentAction(doc.id, 'view')}
                                className="p-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                                title="View PDF"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDocumentAction(doc.id, 'download')}
                                className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDocumentAction(doc.id, 'delete')}
                                className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-red-600"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <EnhancedPDFUpload
                onUploadComplete={handleUploadComplete}
                onUploadError={(error) => console.error('Upload error:', error)}
                onClose={() => setShowUploadModal(false)}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Secure PDF Viewer Modal */}
        {showPdfViewer && currentDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
            <div className="w-full h-full">
              <SecurePDFViewer
                fileUrl={currentDocument.url || '/api/files/sample-contract.pdf'}
                fileName={currentDocument.name}
                documentId={currentDocument.id}
                onClose={() => setShowPdfViewer(false)}
                className="w-full h-full"
                security={getSecurityPresetForDocument(currentDocument.type, currentDocument.name)}
                onLoadSuccess={(pdf) => console.log('PDF loaded:', pdf.numPages, 'pages')}
                onLoadError={(error) => console.error('PDF error:', error)}
                onSecurityViolation={(violation) => {
                  console.warn('Security violation:', violation);
                  // In production, you might want to log this to an audit system
                }}
                onViewingComplete={(session) => {
                  console.log('Viewing session completed:', session);
                  // In production, save viewing analytics
                }}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
