import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { readFile, writeFile } from 'fs/promises';
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
  status: string;
  base64?: string;
  signedUrl?: string;
  signedDate?: string;
  signedBy?: string;
}

// Helper functions
async function getDocuments(): Promise<Document[]> {
  if (existsSync(DOCS_FILE)) {
    const data = await readFile(DOCS_FILE, 'utf-8');
    return JSON.parse(data);
  }
  return [];
}

async function saveDocuments(documents: Document[]): Promise<void> {
  await writeFile(DOCS_FILE, JSON.stringify(documents, null, 2));
}

// POST - Sign a document
export async function POST(request: NextRequest) {
  try {
    // Parse request
    const formData = await request.formData();
    const docId = formData.get('documentId') as string;
    const signedPdf = formData.get('signedPdf') as File;
    const signedBy = formData.get('signedBy') as string || 'User';
    
    if (!docId || !signedPdf) {
      return NextResponse.json(
        { error: 'Document ID and signed PDF are required' },
        { status: 400 }
      );
    }
    
    // Load documents
    const documents = await getDocuments();
    
    // Find document
    const index = documents.findIndex(doc => doc.id === docId);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Store signed file
    const fileBuffer = await signedPdf.arrayBuffer();
    let signedUrl: string;
    let base64: string | undefined;
    
    // Store file (different methods for dev/prod)
    if (IS_DEV || !process.env.BLOB_READ_WRITE_TOKEN) {
      // In development: store as base64
      base64 = Buffer.from(fileBuffer).toString('base64');
      signedUrl = `data:${signedPdf.type};base64,${base64}`;
    } else {
      // In production: use Vercel Blob Storage
      try {
        const filename = `signed_${docId}_${Date.now()}.pdf`;
        const blob = await put(filename, signedPdf, {
          access: 'public',
        });
        signedUrl = blob.url;
      } catch (blobError) {
        console.error('Blob storage error:', blobError);
        
        // Fallback to base64 if blob fails
        base64 = Buffer.from(fileBuffer).toString('base64');
        signedUrl = `data:${signedPdf.type};base64,${base64}`;
      }
    }
    
    // Update document
    documents[index].status = 'signed';
    documents[index].signedUrl = signedUrl;
    documents[index].signedDate = new Date().toISOString();
    documents[index].signedBy = signedBy;
    
    // If using base64 storage, update the base64 content
    if (base64) {
      documents[index].base64 = base64;
    }
    
    await saveDocuments(documents);
    
    // Return updated document (without base64 data)
    const { base64: _, ...docInfo } = documents[index];
    return NextResponse.json({
      success: true,
      document: docInfo
    });
  } catch (error) {
    console.error('Error signing document:', error);
    return NextResponse.json(
      { error: 'Failed to sign document' },
      { status: 500 }
    );
  }
}