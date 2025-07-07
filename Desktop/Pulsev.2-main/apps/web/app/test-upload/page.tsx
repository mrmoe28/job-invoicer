'use client';

import { useState, useCallback } from 'react';

export default function TestUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
  
  // When file is selected
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };
  
  // Upload the file
  const handleUpload = useCallback(async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      // Log file details
      console.log(`Uploading file: ${file.name} (${file.size} bytes, ${file.type})`);
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Send request to simple upload endpoint
      const response = await fetch('/api/documents/upload-simple', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Upload response status:', response.status);
      
      // Parse response
      const data = await response.json();
      console.log('Upload response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }
      
      // Save result
      setResult(data);
      
      // Add to uploaded documents
      if (data.file) {
        const newDocument = {
          id: data.file.id,
          name: data.file.originalName,
          url: data.file.url,
          size: data.file.size,
          date: new Date().toISOString(),
        };
        
        setUploadedDocuments(prev => [newDocument, ...prev]);
      }
      
      // Reset file input
      setFile(null);
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setUploading(false);
    }
  }, [file]);
  
  // View document
  const handleView = (url: string) => {
    window.open(url, '_blank');
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Simple Document Upload Test</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
        
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Select file
          </label>
          <input
            id="file-input"
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {file && (
            <p className="mt-1 text-sm text-gray-500">
              Selected: {file.name} ({Math.round(file.size / 1024)} KB)
            </p>
          )}
        </div>
        
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`w-full py-2 px-4 rounded-md ${
            !file || uploading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {result && result.success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
            Upload successful!
          </div>
        )}
      </div>
      
      {/* Uploaded Documents */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Uploaded Documents</h2>
        
        {uploadedDocuments.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No documents uploaded yet</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {uploadedDocuments.map((doc) => (
              <li key={doc.id} className="py-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{doc.name}</h3>
                    <p className="text-sm text-gray-500">
                      Size: {Math.round(doc.size / 1024)} KB • Uploaded: {new Date(doc.date).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleView(doc.url)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                  >
                    View
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Debug Information */}
      <div className="mt-8 bg-gray-100 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
        <p className="text-sm text-gray-700">
          This component uses a simplified upload endpoint that doesn't rely on authentication or complex database integration.
          It's designed to work even when other parts of the application are having issues.
        </p>
        <p className="text-sm text-gray-700 mt-2">
          Endpoint: <code>/api/documents/upload-simple</code>
        </p>
      </div>
    </div>
  );
}
