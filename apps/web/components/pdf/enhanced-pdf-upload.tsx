'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, File, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { cn } from '../../lib/utils';

interface UploadedFile extends File {
  id: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  uploadedUrl?: string;
}

interface EnhancedPDFUploadProps {
  onUploadComplete?: (files: any[]) => void;
  onUploadError?: (error: string) => void;
  onClose?: () => void;
  className?: string;
}

export default function EnhancedPDFUpload({ 
  onUploadComplete, 
  onUploadError, 
  onClose,
  className 
}: EnhancedPDFUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate unique ID for files
  const generateFileId = () => Math.random().toString(36).substr(2, 9);

  // Validate PDF file
  const validatePDFFile = (file: File): string | null => {
    // Check file type
    if (file.type !== 'application/pdf') {
      return 'Only PDF files are allowed';
    }

    // Check file size (max 50MB for PDFs)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return 'File size must be less than 50MB';
    }

    // Check if file is empty
    if (file.size === 0) {
      return 'File cannot be empty';
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const pdfFiles = fileArray.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
      onUploadError?.('Please select only PDF files');
      return;
    }

    if (pdfFiles.length !== fileArray.length) {
      onUploadError?.('Some files were ignored - only PDF files are allowed');
    }

    const newFiles: UploadedFile[] = pdfFiles.map(file => {
      const error = validatePDFFile(file);
      return {
        ...file,
        id: generateFileId(),
        progress: 0,
        status: error ? 'error' : 'uploading',
        error: error || undefined
      } as UploadedFile;
    });

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Start upload for valid files
    newFiles.forEach(file => {
      if (file.status === 'uploading') {
        uploadFile(file);
      }
    });
  }, [onUploadError]);

  // Upload individual file
  const uploadFile = async (file: UploadedFile) => {
    setIsUploading(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('files', file);

      // Track upload progress
      const xhr = new XMLHttpRequest();

      // Handle progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadedFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, progress } : f
          ));
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success && response.files && response.files.length > 0) {
              const uploadedFile = response.files[0];
              setUploadedFiles(prev => prev.map(f => 
                f.id === file.id 
                  ? { 
                      ...f, 
                      progress: 100, 
                      status: 'success',
                      uploadedUrl: uploadedFile.url 
                    } 
                  : f
              ));
            } else {
              throw new Error(response.error || 'Upload failed');
            }
          } catch (parseError) {
            throw new Error('Invalid server response');
          }
        } else {
          throw new Error(`Upload failed: ${xhr.statusText}`);
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        setUploadedFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, status: 'error', error: 'Network error occurred' }
            : f
        ));
      });

      // Send request
      xhr.open('POST', '/api/files/upload');
      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadedFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { 
              ...f, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Upload failed' 
            }
          : f
      ));
    }

    // Check if all uploads are complete
    setTimeout(() => {
      const allComplete = uploadedFiles.every(f => f.status !== 'uploading');
      if (allComplete) {
        setIsUploading(false);
        const successfulFiles = uploadedFiles.filter(f => f.status === 'success');
        if (successfulFiles.length > 0) {
          onUploadComplete?.(successfulFiles);
        }
      }
    }, 500);
  };

  // Drag and drop handlers
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // File input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  }, [handleFileSelect]);

  // Remove file
  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // Retry upload
  const retryUpload = useCallback((file: UploadedFile) => {
    setUploadedFiles(prev => prev.map(f => 
      f.id === file.id 
        ? { ...f, status: 'uploading', progress: 0, error: undefined }
        : f
    ));
    uploadFile(file);
  }, []);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("bg-gray-800 rounded-lg", className)}>
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-700">
        <div>
          <h2 className="text-xl font-bold text-white">Upload PDF Documents</h2>
          <p className="text-gray-400 mt-1">Upload construction documents, contracts, plans, and reports</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Upload Area */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
            isDragOver 
              ? "border-orange-500 bg-orange-500/10" 
              : "border-gray-600 hover:border-gray-500",
            isUploading && "pointer-events-none opacity-50"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-white mb-2">
            {isDragOver ? 'Drop PDF files here' : 'Drag & drop PDF files here'}
          </p>
          <p className="text-gray-400 mb-4">or</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Choose PDF Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,application/pdf"
            onChange={handleInputChange}
            className="hidden"
          />
          <p className="text-xs text-gray-500 mt-4">
            Maximum file size: 50MB per PDF • Supported format: PDF
          </p>
        </div>

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">
                Files ({uploadedFiles.length})
              </h3>
              {uploadedFiles.some(f => f.status === 'error') && (
                <button
                  onClick={() => {
                    uploadedFiles.forEach(file => {
                      if (file.status === 'error') {
                        retryUpload(file);
                      }
                    });
                  }}
                  className="text-sm text-orange-400 hover:text-orange-300"
                >
                  Retry Failed
                </button>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <File className="w-8 h-8 text-red-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Status Icon */}
                      {file.status === 'uploading' && (
                        <Loader className="w-5 h-5 text-orange-400 animate-spin" />
                      )}
                      {file.status === 'success' && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                      {file.status === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      )}

                      {/* Actions */}
                      {file.status === 'error' && (
                        <button
                          onClick={() => retryUpload(file)}
                          className="text-xs text-orange-400 hover:text-orange-300 px-2 py-1 rounded"
                        >
                          Retry
                        </button>
                      )}
                      
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {file.status === 'uploading' && (
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}

                  {/* Error Message */}
                  {file.status === 'error' && file.error && (
                    <div className="mt-2 text-sm text-red-400 bg-red-900/20 rounded p-2">
                      {file.error}
                    </div>
                  )}

                  {/* Success Message */}
                  {file.status === 'success' && (
                    <div className="mt-2 text-sm text-green-400">
                      ✓ Upload completed successfully
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Upload Summary */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                {uploadedFiles.filter(f => f.status === 'success').length} of {uploadedFiles.length} uploaded
              </span>
              {uploadedFiles.some(f => f.status === 'error') && (
                <span className="text-red-400">
                  {uploadedFiles.filter(f => f.status === 'error').length} failed
                </span>
              )}
            </div>
          </div>
        )}

        {/* Upload Tips */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-2">💡 Upload Tips</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• For best results, use high-quality scanned PDFs</li>
            <li>• Large files may take longer to process and upload</li>
            <li>• You can upload multiple PDFs at once</li>
            <li>• Uploaded documents will be automatically organized and searchable</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
