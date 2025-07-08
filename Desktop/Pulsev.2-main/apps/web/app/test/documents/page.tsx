'use client';

import { useState, useEffect } from 'react';

export default function DocumentTestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [viewingDocument, setViewingDocument] = useState<string | null>(null);
  
  // Load documents from localStorage on page load
  useEffect(() => {
    try {
      const storedDocs = localStorage.getItem('pulse-test-documents');
      if (storedDocs) {
        setDocuments(JSON.parse(storedDocs));
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  }, []);
  
  // Save documents to localStorage when they change
  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem('pulse-test-documents', JSON.stringify(documents));
    }
  }, [documents]);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setErrorMessage(null);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a file first');
      return;
    }
    
    try {
      setUploading(true);
      setErrorMessage(null);
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Log what we're uploading
      console.log(`Uploading file: ${selectedFile.name} (${selectedFile.size} bytes, ${selectedFile.type})`);
      
      // Send to server
      const response = await fetch('/api/test/upload', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Upload response status:', response.status);
      const data = await response.json();
      console.log('Upload response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }
      
      // Save result
      setUploadResult(data);
      
      // Add to documents list
      if (data.file) {
        const newDocument = {
          id: data.file.id || Date.now().toString(),
          name: data.file.name || selectedFile.name,
          url: data.file.url || '#',
          uploadedAt: new Date().toISOString(),
          size: data.file.size || selectedFile.size,
        };
        
        setDocuments(prev => [newDocument, ...prev]);
      }
      
      // Reset selected file
      setSelectedFile(null);
      if (document.getElementById('file-input') as HTMLInputElement) {
        (document.getElementById('file-input') as HTMLInputElement).value = '';
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setUploading(false);
    }
  };
  
  const handleLocalUpload = () => {
    if (!selectedFile) {
      setErrorMessage('Please select a file first');
      return;
    }
    
    // For testing: store file in local storage as base64
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const base64data = e.target?.result as string;
        
        // Create a document object
        const newDocument = {
          id: Date.now().toString(),
          name: selectedFile.name,
          url: base64data,
          uploadedAt: new Date().toISOString(),
          size: selectedFile.size,
          isLocal: true,
        };
        
        // Add to documents list
        setDocuments(prev => [newDocument, ...prev]);
        
        // Reset selected file
        setSelectedFile(null);
        if (document.getElementById('file-input') as HTMLInputElement) {
          (document.getElementById('file-input') as HTMLInputElement).value = '';
        }
        
        setUploadResult({ success: true, message: 'File stored locally' });
        
      } catch (error) {
        console.error('Local storage error:', error);
        setErrorMessage('Failed to store file locally');
      }
    };
    
    reader.onerror = () => {
      setErrorMessage('Failed to read file');
    };
    
    reader.readAsDataURL(selectedFile);
  };
  
  const clearDocuments = () => {
    if (confirm('Are you sure you want to clear all documents?')) {
      setDocuments([]);
      localStorage.removeItem('pulse-test-documents');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Document Upload Test</h1>
          <p className="mb-4 text-gray-600">
            This page tests basic document upload and viewing functionality without complex dependencies.
            It can store documents either in localStorage or attempt to use the server API.
          </p>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h2 className="text-lg font-semibold mb-3">Upload Test Document</h2>
            
            <div className="mb-4">
              <input
                id="file-input"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              
              {selectedFile && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                </div>
              )}
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className={`px-4 py-2 rounded-md text-white ${
                  !selectedFile || uploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {uploading ? 'Uploading...' : 'Upload to Server'}
              </button>
              
              <button
                onClick={handleLocalUpload}
                disabled={!selectedFile}
                className={`px-4 py-2 rounded-md text-white ${
                  !selectedFile
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                Store Locally
              </button>
            </div>
            
            {errorMessage && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
                {errorMessage}
              </div>
            )}
            
            {uploadResult && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
                {uploadResult.success ? 'Upload successful!' : 'Upload failed'}
                {uploadResult.message && <p>{uploadResult.message}</p>}
              </div>
            )}
          </div>
        </div>
        
        {/* Documents List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Documents ({documents.length})</h2>
            
            {documents.length > 0 && (
              <button
                onClick={clearDocuments}
                className="px-3 py-1 bg-red-100 text-red-600 rounded-md text-sm hover:bg-red-200"
              >
                Clear All
              </button>
            )}
          </div>
          
          {documents.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No documents uploaded yet
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{doc.name}</h3>
                      <p className="text-sm text-gray-500">
                        Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
                        {' · '}
                        {Math.round(doc.size / 1024)} KB
                        {doc.isLocal && ' · Stored locally'}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setViewingDocument(doc.url)}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold">Document Viewer</h3>
              <button
                onClick={() => setViewingDocument(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="flex-1 p-2 overflow-auto bg-gray-100">
              {viewingDocument.startsWith('data:image') ? (
                <div className="flex items-center justify-center h-full">
                  <img 
                    src={viewingDocument} 
                    alt="Document" 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : viewingDocument.startsWith('data:application/pdf') ? (
                <iframe
                  src={viewingDocument}
                  className="w-full h-full border-0"
                  title="PDF Document"
                />
              ) : (
                <iframe
                  src={viewingDocument}
                  className="w-full h-full border-0"
                  title="Document"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
