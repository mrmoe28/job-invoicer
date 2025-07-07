import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import os from 'os';

// Configure Next.js to handle larger file uploads
export const config = {
  api: {
    bodyParser: false, // Disable the default body parser to handle larger files
    responseLimit: '8mb', // Increase response size limit for base64 data
  },
};
import { put } from '@vercel/blob';

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
  console.log('Environment:', process.env.NODE_ENV);
  console.log('BLOB_READ_WRITE_TOKEN configured:', !!process.env.BLOB_READ_WRITE_TOKEN);
  
  try {
    // Log request details
    console.log('Request method:', request.method);
    console.log('Request headers:', [...request.headers.entries()]);
    
    // Parse form data
    console.log('Parsing form data...');
    let formData;
    try {
      formData = await request.formData();
      console.log('Form data keys:', [...formData.keys()]);
    } catch (formError) {
      console.error('Error parsing form data:', formError);
      return NextResponse.json(
        { error: 'Error parsing form data', details: formError instanceof Error ? formError.message : 'Unknown error' },
        { status: 400 }
      );
    }
    
    // Get file from form data
    const file = formData.get('file') as File;
    console.log('File received:', file ? `${file.name} (${file.size} bytes, ${file.type})` : 'No file');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Ensure directories exist
    try {
      await ensureDirectories();
      console.log('Directories ensured');
    } catch (dirError) {
      console.error('Error ensuring directories:', dirError);
      return NextResponse.json(
        { error: 'Error creating directories', details: dirError instanceof Error ? dirError.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    console.log('Generated filename:', filename);
    
    // File content handling
    let fileUrl: string;
    let base64Data: string | undefined;
    
    // Default to development mode or when blob token is missing
    const useLocalStorage = isDevelopment || !process.env.BLOB_READ_WRITE_TOKEN;
    console.log('Using local storage:', useLocalStorage);
    
    if (useLocalStorage) {
      // Store as base64 in metadata (for development or when blob storage is not configured)
      try {
        console.log('Converting file to base64...');
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        base64Data = buffer.toString('base64');
        fileUrl = `data:${file.type};base64,${base64Data.substring(0, 20)}...`; // Log truncated for brevity
        console.log('File converted to base64 successfully');
      } catch (base64Error) {
        console.error('Error converting file to base64:', base64Error);
        return NextResponse.json(
          { error: 'Error processing file', details: base64Error instanceof Error ? base64Error.message : 'Unknown error' },
          { status: 500 }
        );
      }
    } else {
      // In production with Vercel Blob Storage configured
      try {
        console.log('Uploading to Vercel Blob Storage...');
        console.log('File details for blob:', file.name, file.size, file.type);
        
        const blob = await put(filename, file, {
          access: 'public',
          addRandomSuffix: false, // Use our timestamp-based name
        });
        fileUrl = blob.url;
        console.log('File uploaded to Vercel Blob:', blob.url);
      } catch (blobError) {
        console.error('Error uploading to Vercel Blob:', blobError);
        console.error('Blob error details:', JSON.stringify(blobError));
        
        // Fallback to base64 if blob upload fails
        try {
          console.log('Falling back to base64 storage...');
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          base64Data = buffer.toString('base64');
          fileUrl = `data:${file.type};base64,${base64Data.substring(0, 20)}...`; // Log truncated
          console.log('Fallback successful: Storing file as base64');
        } catch (fallbackError) {
          console.error('Error in base64 fallback:', fallbackError);
          return NextResponse.json(
            { error: 'Error processing file (fallback failed)', details: fallbackError instanceof Error ? fallbackError.message : 'Unknown error' },
            { status: 500 }
          );
        }
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
      ...(base64Data ? { base64Data } : {})
    };

    // Load existing metadata and add new document
    try {
      console.log('Loading existing metadata...');
      const metadata = await loadMetadata();
      console.log('Current document count:', metadata.length);
      
      metadata.unshift(newDocument);
      await saveMetadata(metadata);
      console.log('Metadata saved successfully. New count:', metadata.length);
    } catch (metadataError) {
      console.error('Error saving metadata:', metadataError);
      return NextResponse.json(
        { error: 'Error saving document metadata', details: metadataError instanceof Error ? metadataError.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Create response without the base64Data to reduce payload size
    const responseDocument = {
      id: newDocument.id,
      name: newDocument.name,
      filename: newDocument.filename,
      size: newDocument.size,
      type: newDocument.type,
      uploadDate: newDocument.uploadDate,
      category: newDocument.category,
      status: newDocument.status,
      url: fileUrl
    };
    
    console.log('Upload successful. Returning document:', JSON.stringify(responseDocument));
    
    return NextResponse.json({
      success: true,
      document: responseDocument
    });
  } catch (error) {
    console.error('Error in POST /api/documents/upload:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
    return NextResponse.json(
      { 
        error: 'Failed to upload document', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
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