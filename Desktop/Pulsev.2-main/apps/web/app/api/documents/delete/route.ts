import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const DATA_DIR = path.join(process.cwd(), 'apps/web/data');
const METADATA_FILE = path.join(DATA_DIR, 'documents-metadata.json');
const isDevelopment = process.env.NODE_ENV === 'development';

interface DocumentMetadata {
  id: string;
  name: string;
  filename: string;
  size: number;
  type: string;
  uploadDate: string;
  category?: string;
  status?: string;
  url: string;
  base64Data?: string;
}

async function loadMetadata(): Promise<DocumentMetadata[]> {
  try {
    if (existsSync(METADATA_FILE)) {
      const data = await readFile(METADATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading metadata:', error);
  }
  return [];
}

async function saveMetadata(metadata: DocumentMetadata[]): Promise<void> {
  try {
    await writeFile(
      METADATA_FILE,
      JSON.stringify(metadata, null, 2),
      'utf-8'
    );
  } catch (error) {
    console.error('Error saving metadata:', error);
  }
}

export async function DELETE(request: NextRequest) {
  console.log('DELETE /api/documents/delete - Request received');

  try {
    // Get document ID from the URL
    const url = new URL(request.url);
    const documentId = url.searchParams.get('id');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Load metadata
    const metadata = await loadMetadata();
    
    // Find document
    const documentIndex = metadata.findIndex(doc => doc.id === documentId);
    if (documentIndex === -1) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    const document = metadata[documentIndex];
    
    // Delete file from Vercel Blob if URL is not base64
    if (document.url && !document.url.startsWith('data:') && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        console.log('Deleting from Vercel Blob:', document.filename);
        await del(document.url);
        console.log('File deleted from Vercel Blob');
      } catch (blobError) {
        console.error('Error deleting from Vercel Blob:', blobError);
        // Continue with metadata removal even if blob deletion fails
      }
    }
    
    // Remove from metadata
    metadata.splice(documentIndex, 1);
    await saveMetadata(metadata);
    
    console.log('Document deleted successfully');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/documents/delete:', error);
    return NextResponse.json(
      { error: 'Failed to delete document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}