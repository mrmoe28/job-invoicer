'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, Upload, Download, Trash2, Search, 
  Filter, Eye, Check, X, LayoutGrid, LayoutList,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard-layout';
import { useToast } from '@/components/Toast';

// Document type
interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  category: string;
  uploadDate: string;
  url: string;
  status: 'draft' | 'pending' | 'signed';
  uploadedBy?: string;
}

// Document categories
const CATEGORIES = [
  { id: 'contract', name: 'Contract' },
  { id: 'proposal', name: 'Proposal' },
  { id: 'invoice', name: 'Invoice' },
  { id: 'agreement', name: 'Agreement' },
  { id: 'permit', name: 'Permit' },
  { id: 'other', name: 'Other' }
];

// Format file size for display
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function DocumentsPage() {
  // State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewDocument, setViewDocument] = useState<Document | null>(null);
  const [uploadCategory, setUploadCategory] = useState('contract');
  const [error, setError] = useState<string | null>(null);
  
  // Toast notifications
  const { addToast, ToastContainer } = useToast();

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  // Load documents from API
  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/documents', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
        console.log('Documents loaded:', data.documents?.length || 0);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load documents';
      setError(errorMessage);
      addToast(`Failed to load documents: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    
    try {
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type (PDF only)
        if (file.type !== 'application/pdf') {
          addToast(`${file.name} is not a PDF file`, 'error');
          continue;
        }
        
        // Validate file size (max 25MB)
        if (file.size > 25 * 1024 * 1024) {
          addToast(`${file.name} exceeds the 25MB limit`, 'error');
          continue;
        }
        
        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', uploadCategory);
        
        console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
        
        // Upload file
        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Upload successful:', data);
          
          // Add document to list
          setDocuments(prev => [data.document, ...prev]);
          addToast(`${file.name} uploaded successfully`, 'success');
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Upload failed:', errorData);
          addToast(`Failed to upload ${file.name}: ${errorData.error || 'Unknown error'}`, 'error');
        }
      }
      
      // Close upload modal after processing all files
      setShowUpload(false);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during upload';
      addToast(`Upload failed: ${errorMessage}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  // Handle document deletion
  const handleDeleteDocument = async (doc: Document) => {
    if (!confirm(`Are you sure you want to delete "${doc.name}"?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/documents/${doc.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setDocuments(prev => prev.filter(d => d.id !== doc.id));
        addToast(`${doc.name} deleted successfully`, 'success');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        addToast(`Failed to delete ${doc.name}: ${errorData.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while deleting the document';
      addToast(`Delete failed: ${errorMessage}`, 'error');
    }
  };

  // Get status badge styles
  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-600 text-white',
      pending: 'bg-yellow-600 text-white',
      signed: 'bg-green-600 text-white'
    };
    
    return styles[status as keyof typeof styles] || 'bg-gray-600 text-white';
  };

  // Filter documents
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = !searchTerm || 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || doc.category === categoryFilter;
    
    const matchesStatus = !statusFilter || doc.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <DashboardLayout title="Document Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Documents</h1>
            <p className="text-gray-400 mt-1">
              Manage your solar project documents, contracts, and agreements
            </p>
          </div>
          
          <button
            onClick={() => setShowUpload(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-400 font-medium">Error loading documents</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
            <button
              onClick={loadDocuments}
              className="ml-auto bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
            >
              Retry
            </button>
          </div>
        )}
        
        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg text-white px-3 py-2 focus:border-orange-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg text-white px-3 py-2 focus:border-orange-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="signed">Signed</option>
          </select>
          
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
              title="List view"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Upload Document</h2>
                <button 
                  onClick={() => setShowUpload(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={uploading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category selection */}
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Document Category
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg text-white px-3 py-2 focus:border-orange-500 focus:outline-none"
                  disabled={uploading}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  uploading 
                    ? 'opacity-50 cursor-not-allowed border-gray-600' 
                    : 'hover:border-orange-500 hover:bg-gray-700 border-gray-600'
                }`}
                onClick={() => {
                  if (!uploading) {
                    document.getElementById('file-upload')?.click();
                  }
                }}
              >
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-2"></div>
                    <p className="text-gray-400">Uploading...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-2">Click to browse or drag & drop</p>
                    <p className="text-gray-500 text-sm">PDF files only (max 25MB)</p>
                  </>
                )}
                
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept="application/pdf"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  disabled={uploading}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Document Viewer */}
        {viewDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-4 w-full max-w-4xl h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white truncate">{viewDocument.name}</h2>
                <button 
                  onClick={() => setViewDocument(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 bg-gray-900 rounded overflow-hidden">
                <iframe 
                  src={viewDocument.url} 
                  className="w-full h-full"
                  title={viewDocument.name}
                />
              </div>
              
              <div className="flex justify-end mt-4 space-x-3">
                <a
                  href={viewDocument.url}
                  download={viewDocument.name}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
                <button 
                  onClick={() => setViewDocument(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Document List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading documents...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">No documents found</p>
            <p className="text-gray-500">
              {documents.length === 0 
                ? "Upload your first document to get started" 
                : "Try changing your search filters"}
            </p>
            {documents.length === 0 && (
              <button
                onClick={() => setShowUpload(true)}
                className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 mx-auto transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload First Document
              </button>
            )}
          </div>
        ) : viewMode === 'list' ? (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-white">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-300">
                        {CATEGORIES.find(c => c.id === doc.category)?.name || doc.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(doc.status)}`}>
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {formatFileSize(doc.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {new Date(doc.uploadDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setViewDocument(doc)}
                          className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {doc.status !== 'signed' && (
                          <a
                            href={`/dashboard/documents/sign?id=${doc.id}`}
                            className="text-orange-400 hover:text-orange-300 transition-colors p-1"
                            title="Sign Document"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </a>
                        )}
                        <a
                          href={doc.url}
                          download={doc.name}
                          className="text-green-400 hover:text-green-300 transition-colors p-1"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDeleteDocument(doc)}
                          className="text-red-400 hover:text-red-300 transition-colors p-1"
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocs.map(doc => (
              <div key={doc.id} className="bg-gray-800 rounded-lg overflow-hidden flex flex-col hover:bg-gray-750 transition-colors">
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center min-w-0 flex-1">
                      <FileText className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                      <h3 className="text-white font-medium truncate" title={doc.name}>{doc.name}</h3>
                    </div>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs flex-shrink-0 ${getStatusBadge(doc.status)}`}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="text-gray-400 text-sm space-y-1 mb-4">
                    <p>Category: {CATEGORIES.find(c => c.id === doc.category)?.name || doc.category}</p>
                    <p>Size: {formatFileSize(doc.size)}</p>
                    <p>Added: {new Date(doc.uploadDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="bg-gray-700 p-3 flex justify-around">
                  <button
                    onClick={() => setViewDocument(doc)}
                    className="text-blue-400 hover:text-blue-300 p-2 transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {doc.status !== 'signed' && (
                    <a
                      href={`/dashboard/documents/sign?id=${doc.id}`}
                      className="text-orange-400 hover:text-orange-300 p-2 transition-colors"
                      title="Sign Document"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </a>
                  )}
                  <a
                    href={doc.url}
                    download={doc.name}
                    className="text-green-400 hover:text-green-300 p-2 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDeleteDocument(doc)}
                    className="text-red-400 hover:text-red-300 p-2 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <ToastContainer />
    </DashboardLayout>
  );
}