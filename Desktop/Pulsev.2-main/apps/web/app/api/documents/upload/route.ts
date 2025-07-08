import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Constants
const DATA_DIR = path.join(process.cwd(), 'apps/web/data');
const DOCS_FILE = path.join(DATA_DIR, 'documents.json');
const IS_DEV = process.env.NODE_ENV === 'development';

// Document interface
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

// Helper functions
async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function getDocuments(): Promise<Document[]> {
  await ensureDataDir();
  
  if (existsSync(DOCS_FILE)) {
    try {
      const data = await readFile(DOCS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading documents file:', error);
      return [];
    }
  }
  return [];
}

async function saveDocuments(documents: Document[]): Promise<void> {
  await ensureDataDir();
  await writeFile(DOCS_FILE, JSON.stringify(documents, null, 2));
}

function sanitizeFilename(filename: string): string {
  // Remove or replace problematic characters
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
}

// POST - Upload a document
export async function POST(request: NextRequest) {
  try {
    // Check if request is multipart/form-data
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type must be multipart/form-data' }, 
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = (formData.get('category') as string) || 'contract';
    
    // Validate file
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No valid file provided' }, 
        { status: 400 }
      );
    }

    // Validate file type (PDF only)
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' }, 
        { status: 400 }
      );
    }

    // Validate file size (max 25MB)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 25MB limit' }, 
        { status: 400 }
      );
    }

    // Generate document ID and metadata
    const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sanitizedName = sanitizeFilename(file.name);
    const fileBuffer = await file.arrayBuffer();
    
    let url: string;
    
    // Store file based on environment and blob availability
    if (process.env.BLOB_READ_WRITE_TOKEN && !IS_DEV) {
      try {
        // Production: use Vercel Blob Storage
        const blob = await put(`${id}-${sanitizedName}`, file, {
          access: 'public',
          addRandomSuffix: false,
        });
        url = blob.url;
        console.log('File uploaded to blob storage:', blob.url);
      } catch (blobError) {
        console.error('Blob storage error:', blobError);
        return NextResponse.json(
          { error: 'Failed to upload to cloud storage' }, 
          { status: 500 }
        );
      }
    } else {
      // Development: store as data URL (not recommended for production)
      const base64 = Buffer.from(fileBuffer).toString('base64');
      url = `data:${file.type};base64,${base64}`;
      console.log('File stored as base64 (development mode)');
    }
    
    // Create document record
    const document: Document = {
      id,
      name: file.name,
      size: file.size,
      type: file.type,
      category,
      uploadDate: new Date().toISOString(),
      url,
      status: 'draft',
      uploadedBy: request.headers.get('x-auth-user-id') || 'demo-user',
    };
    
    // Add to document storage
    const documents = await getDocuments();
    documents.unshift(document); // Add to beginning
    await saveDocuments(documents);
    
    console.log('Document uploaded successfully:', {
      id: document.id,
      name: document.name,
      size: document.size,
      category: document.category
    });
    
    return NextResponse.json({ 
      success: true, 
      document,
      message: 'Document uploaded successfully'
    });
    
  } catch (error) {
    console.error('Document upload error:', error);
    
    // Return appropriate error message
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred during upload' },
      { status: 500 }
    );
  }
}

// GET - Retrieve all documents
export async function GET() {
  try {
    const documents = await getDocuments();
    
    return NextResponse.json({ 
      success: true,
      documents,
      count: documents.length
    });
    
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
