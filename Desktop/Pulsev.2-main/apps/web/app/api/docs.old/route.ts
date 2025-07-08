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
  base64?: string; // Only used in development
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
    const data = await readFile(DOCS_FILE, 'utf-8');
    return JSON.parse(data);
  }
  return [];
}

async function saveDocuments(documents: Document[]): Promise<void> {
  await ensureDataDir();
  await writeFile(DOCS_FILE, JSON.stringify(documents, null, 2));
}

// GET - Retrieve all documents
export async function GET() {
  try {
    // Load documents
    const documents = await getDocuments();
    
    // Remove base64 data from response to reduce payload size
    const cleanDocs = documents.map(({ base64, ...doc }) => doc);
    
    return NextResponse.json({ documents: cleanDocs });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST - Upload a document
export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'general';
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Generate document ID and metadata
    const id = `doc_${Date.now()}`;
    const fileBuffer = await file.arrayBuffer();
    let url: string;
    let base64: string | undefined;
    
    // Store file (different methods for dev/prod)
    if (IS_DEV || !process.env.BLOB_READ_WRITE_TOKEN) {
      // In development: store as base64
      base64 = Buffer.from(fileBuffer).toString('base64');
      url = `data:${file.type};base64,${base64}`;
    } else {
      // In production: use Vercel Blob Storage
      try {
        const blob = await put(`${id}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`, file, {
          access: 'public',
        });
        url = blob.url;
      } catch (blobError) {
        console.error('Blob storage error:', blobError);
        
        // Fallback to base64 if blob fails
        base64 = Buffer.from(fileBuffer).toString('base64');
        url = `data:${file.type};base64,${base64}`;
      }
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
      ...(base64 && { base64 })
    };
    
    // Add to document storage
    const documents = await getDocuments();
    documents.unshift(document);
    await saveDocuments(documents);
    
    // Return document info (without base64 data)
    const { base64: _, ...docInfo } = document;
    return NextResponse.json({ success: true, document: docInfo });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}