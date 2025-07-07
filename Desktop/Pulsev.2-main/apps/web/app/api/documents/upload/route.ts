import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import os from 'os';
import { put, list, del } from '@vercel/blob';

// In development, use temp directory; in production, use Vercel Blob Storage
const isDevelopment = process.env.NODE_ENV === 'development';
const TEMP_DIR = path.join(os.tmpdir(), 'constructflow-uploads');
const DATA_DIR = path.join(process.cwd(), 'apps/web/data');
const METADATA_FILE = path.join(DATA_DIR, 'documents-metadata.json');

// Document metadata structure
interface DocumentMetadata {
  id: string;
  name: string;
  filename: string;
  size: number;
  type: string;
  uploadDate: string;
  category?: string;
  status?: string;
  url: string; // Store Vercel Blob URL or base64 data
  base64Data?: string; // Store file data for development only
}

async function ensureDirectories() {
  try {
    if (isDevelopment && !existsSync(TEMP_DIR)) {
      await mkdir(TEMP_DIR, { recursive: true });
      console.log('Created temp upload directory:', TEMP_DIR);
    }
    if (!existsSync(DATA_DIR)) {
      await mkdir(DATA_DIR, { recursive: true });
      console.log('Created data directory:', DATA_DIR);
    }
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

async function loadMetadata(): Promise<DocumentMetadata[]> {
  try {
    await ensureDirectories();
    
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
    await ensureDirectories();
    await writeFile(
      METADATA_FILE,
      JSON.stringify(metadata, null, 2),
      'utf-8'
    );
  } catch (error) {
    console.error('Error saving metadata:', error);
  }
}

export async function POST(request: NextRequest) {
  console.log('POST /api/documents/upload - Request received');
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('File received:', file?.name, file?.size);
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Ensure directories exist
    await ensureDirectories();

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    
    // File content handling
    let fileUrl: string;
    let base64Data: string | undefined;
    
    if (isDevelopment) {
      // In development: store as base64 in metadata
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      base64Data = buffer.toString('base64');
      fileUrl = `data:${file.type};base64,${base64Data}`;
      console.log('Storing file as base64 in development mode');
    } else {
      // In production: use Vercel Blob Storage
      try {
        console.log('Uploading to Vercel Blob Storage...');
        const blob = await put(filename, file, {
          access: 'public',
          addRandomSuffix: false, // Use our timestamp-based name
        });
        fileUrl = blob.url;
        console.log('File uploaded to Vercel Blob:', blob.url);
      } catch (blobError) {
        console.error('Error uploading to Vercel Blob:', blobError);
        return NextResponse.json(
          { error: 'Failed to upload to Vercel Blob Storage', details: blobError instanceof Error ? blobError.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }

    // Create document metadata
    const newDocument: DocumentMetadata = {
      id: timestamp.toString(),
      name: file.name,
      filename: filename,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString(),
      category: formData.get('category') as string || 'contracts',
      status: 'draft',
      url: fileUrl,
      ...(isDevelopment && base64Data ? { base64Data } : {})
    };

    // Load existing metadata and add new document
    const metadata = await loadMetadata();
    metadata.unshift(newDocument);
    await saveMetadata(metadata);

    console.log('Metadata saved successfully');

    return NextResponse.json({
      success: true,
      document: {
        id: newDocument.id,
        name: newDocument.name,
        filename: newDocument.filename,
        size: newDocument.size,
        type: newDocument.type,
        uploadDate: newDocument.uploadDate,
        category: newDocument.category,
        status: newDocument.status,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Error in POST /api/documents/upload:', error);
    return NextResponse.json(
      { error: 'Failed to upload document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  console.log('GET /api/documents/upload - Request received');
  
  try {
    const metadata = await loadMetadata();
    const documents = metadata.map(doc => ({
      id: doc.id,
      name: doc.name,
      filename: doc.filename,
      size: doc.size,
      type: doc.type,
      uploadDate: doc.uploadDate,
      category: doc.category,
      status: doc.status,
      url: doc.url // Already contains the correct URL (base64 or Vercel Blob)
    }));
    
    console.log('Returning documents:', documents.length);
    
    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error in GET /api/documents/upload:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}