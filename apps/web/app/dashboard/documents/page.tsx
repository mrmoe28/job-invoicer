'use client';

import React, { useState } from 'react';
import { FileText, Upload, Download, Trash2, Search, Filter, FolderPlus, Eye, PenTool } from 'lucide-react';
import { useToast } from '@/components/Toast';
import DocumentViewer from '@/components/DocumentViewer';
import DocumentSigner from '@/components/DocumentSigner';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  file?: File; // Store the actual File object for local files
  uploadDate: Date;
  category?: string;
  status?: 'draft' | 'pending_signature' | 'signed' | 'completed';
}

// Document categories
const DOCUMENT_CATEGORIES = {
  contracts: { id: 'contracts', name: 'Contracts', icon: '📄' },
  invoices: { id: 'invoices', name: 'Invoices', icon: '🧾' },
  permits: { id: 'permits', name: 'Permits', icon: '📋' },
  blueprints: { id: 'blueprints', name: 'Blueprints', icon: '📐' },
  safety: { id: 'safety', name: 'Safety Docs', icon: '⛑️' },
} as const;

// Helper functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getCategoryColor(categoryId?: string): string {
  const colors = {
    contracts: 'border-blue-500 text-blue-400',
    invoices: 'border-green-500 text-green-400',
    permits: 'border-purple-500 text-purple-400',
    blueprints: 'border-cyan-500 text-cyan-400',
    safety: 'border-red-500 text-red-400',
  };
  return colors[categoryId as keyof typeof colors] || 'border-gray-500 text-gray-400';
}

export default function DocumentsPage() {
  const { addToast, ToastContainer } = useToast();
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Service Agreement - Smith Project.pdf',
      type: 'application/pdf',
      size: 2458624,
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      uploadDate: new Date('2024-01-15'),
      category: 'contracts',
      status: 'signed'
    },
    {
      id: '2',
      name: 'Building Permit - 123 Main St.pdf',
      type: 'application/pdf',
      size: 1234567,
      url: 'https://pdfobject.com/pdf/sample.pdf',
      uploadDate: new Date('2024-01-10'),
      category: 'permits',
      status: 'draft'
    }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [signingDocument, setSigningDocument] = useState<Document | null>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      let successCount = 0;
      Array.from(files).forEach(file => {
        // Validate file type
        const validTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        
        if (!validTypes.includes(fileExtension)) {
          addToast(`Invalid file type: ${file.name}`, 'error');
          return;
        }
        
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          addToast(`File too large: ${file.name} (max 10MB)`, 'error');
          return;
        }
        
        console.log('File selected:', file.name, file.size);
        // Add file to documents list
        const newDoc: Document = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          file: file, // Store the File object
          uploadDate: new Date(),
          category: 'contracts', // Default category
          status: 'draft'
        };
        setDocuments(prev => [...prev, newDoc]);
        successCount++;
      });
      
      if (successCount > 0) {
        addToast(`Successfully uploaded ${successCount} file${successCount > 1 ? 's' : ''}`, 'success');
        setShowUpload(false);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDelete = (doc: Document) => {
    if (!confirm(`Are you sure you want to delete ${doc.name}?`)) return;
    setDocuments(prev => prev.filter(d => d.id !== doc.id));
    addToast(`Deleted ${doc.name}`, 'success');
  };

  const getFileIcon = (doc: Document) => {
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const getStatusBadge = (status?: Document['status']) => {
    const badges = {
      draft: 'bg-gray-600 text-gray-200',
      pending_signature: 'bg-yellow-600 text-yellow-200',
      signed: 'bg-green-600 text-green-200',
      completed: 'bg-blue-600 text-blue-200'
    };

    const labels = {
      draft: 'Draft',
      pending_signature: 'Pending Signature',
      signed: 'Signed',
      completed: 'Completed'
    };

    if (!status) return null;

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get all categories for filter
  const allCategories = [
    { id: 'all', name: 'All Documents' },
    ...Object.values(DOCUMENT_CATEGORIES).map(cat => ({
      id: cat.id,
      name: cat.name
    }))
  ];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Documents</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </div>
        </div>

        {/* Upload Section */}
        {showUpload && (
          <div className="mb-6 bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Upload New Document</h2>
              <button
                onClick={() => setShowUpload(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging 
                  ? 'border-orange-500 bg-orange-500/10' 
                  : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
              }`}
              onClick={() => document.getElementById('file-upload')?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-orange-500' : 'text-gray-400'}`} />
              <p className={`mb-2 ${isDragging ? 'text-orange-500' : 'text-gray-400'}`}>
                {isDragging ? 'Drop files here...' : 'Drag and drop files here or click to browse'}
              </p>
              <p className="text-sm text-gray-500">Supported formats: PDF, DOC, DOCX, XLS, XLSX</p>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                multiple
                onChange={(e) => {
                  handleFileSelect(e.target.files);
                  // Reset the input
                  e.target.value = '';
                }}
              />
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
            >
              {allCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Document Categories Overview */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.values(DOCUMENT_CATEGORIES).map(category => {
            const count = documents.filter(doc => doc.category === category.id).length;
            return (
              <button
                key={category.id}
                onClick={() => setFilterCategory(category.id)}
                className={`p-4 rounded-lg border transition-colors ${
                  filterCategory === category.id
                    ? 'bg-gray-700 border-orange-500'
                    : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                }`}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="text-sm font-medium text-white">{category.name}</div>
                <div className="text-xs text-gray-400 mt-1">{count} documents</div>
              </button>
            );
          })}
        </div>

        {/* Document List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredDocuments.map((doc) => {
                  const category = Object.values(DOCUMENT_CATEGORIES).find(cat => cat.id === doc.category);
                  
                  return (
                    <tr key={doc.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getFileIcon(doc)}
                          <button
                            onClick={() => setViewingDocument(doc)}
                            className="ml-3 text-white hover:text-orange-500 text-left transition-colors"
                          >
                            {doc.name}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full border ${getCategoryColor(doc.category)}`}>
                          {category?.name || 'Other'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(doc.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {formatFileSize(doc.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingDocument(doc)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {doc.type === 'application/pdf' && doc.status !== 'signed' && doc.status !== 'completed' && (
                            <button
                              onClick={() => setSigningDocument(doc)}
                              className="p-2 text-gray-400 hover:text-orange-500 hover:bg-gray-600 rounded transition-colors"
                              title="Sign Document"
                            >
                              <PenTool className="w-4 h-4" />
                            </button>
                          )}
                          <a
                            href={doc.url}
                            download
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(doc)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-600 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                {searchTerm || filterCategory !== 'all' 
                  ? 'No documents found matching your criteria' 
                  : 'No documents uploaded yet'}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Document Viewer */}
      {viewingDocument && (
        <DocumentViewer
          document={viewingDocument}
          onClose={() => setViewingDocument(null)}
        />
      )}
      
      {/* Document Signer */}
      {signingDocument && (
        <DocumentSigner
          document={signingDocument}
          onClose={() => setSigningDocument(null)}
          onSign={(docId, signatures) => {
            // Update document status
            setDocuments(prev => prev.map(doc => 
              doc.id === docId 
                ? { ...doc, status: 'signed' as const }
                : doc
            ));
            addToast('Document signed successfully!', 'success');
          }}
        />
      )}
      
      <ToastContainer />
    </div>
  );
}