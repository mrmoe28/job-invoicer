import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { writeFile, mkdir, readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import os from 'os';
import { writeFileSync } from 'fs';

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

export async function GET() {
  console.log('GET /api/documents - Request received');
  
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
    console.error('Error in GET /api/documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log('POST /api/documents - Request received');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('BLOB_READ_WRITE_TOKEN configured:', !!process.env.BLOB_READ_WRITE_TOKEN);
  
  try {
    // Handle form data
    const formData = await request.formData();
    console.log('Form data received:', [...formData.keys()]);
    
    const file = formData.get('file') as File;
    if (!file || !file.name) {
      console.error('No file in request or invalid file');
      return NextResponse.json({ error: 'No file uploaded or invalid file' }, { status: 400 });
    }
    
    console.log('File details:', file.name, file.size, file.type);
    
    // Ensure directories exist
    await ensureDirectories();
    
    // Generate unique ID and filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Variable to store file URL (either blob URL or data URL)
    let fileUrl: string;
    let base64Data: string | undefined;
    
    // Determine storage method
    const useLocalStorage = isDevelopment || !process.env.BLOB_READ_WRITE_TOKEN;
    console.log('Using local storage:', useLocalStorage);
    
    if (useLocalStorage) {
      try {
        // Convert file to base64 for storage
        console.log('Converting file to base64...');
        const buffer = Buffer.from(await file.arrayBuffer());
        base64Data = buffer.toString('base64');
        fileUrl = `data:${file.type};base64,${base64Data}`;
        console.log('File converted to base64, length:', base64Data.length);
        
        // For very large files, write to temp file to avoid memory issues
        if (file.size > 5 * 1024 * 1024) { // 5MB
          const tempPath = path.join(TEMP_DIR, filename);
          writeFileSync(tempPath, buffer);
          console.log('Large file saved to temp location:', tempPath);
        }
      } catch (error) {
        console.error('Error processing file for local storage:', error);
        return NextResponse.json({ 
          error: 'Failed to process file', 
          details: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
      }
    } else {
      try {
        // Upload to Vercel Blob Storage
        console.log('Uploading to Vercel Blob Storage...');
        const blob = await put(filename, file, {
          access: 'public',
          addRandomSuffix: false,
        });
        fileUrl = blob.url;
        console.log('File uploaded to Vercel Blob:', blob.url);
      } catch (error) {
        console.error('Error uploading to Vercel Blob:', error);
        
        // Fallback to base64 if blob upload fails
        try {
          console.log('Falling back to base64 storage after Blob error');
          const buffer = Buffer.from(await file.arrayBuffer());
          base64Data = buffer.toString('base64');
          fileUrl = `data:${file.type};base64,${base64Data}`;
          console.log('Fallback to base64 successful, length:', base64Data.length);
        } catch (fallbackError) {
          console.error('Error in base64 fallback:', fallbackError);
          return NextResponse.json({ 
            error: 'Failed to upload document (fallback failed)', 
            details: fallbackError instanceof Error ? fallbackError.message : 'Unknown error',
            original: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 });
        }
      }
    }
    
    // Create document metadata
    const category = formData.get('category') as string || 'contracts';
    const documentMetadata: DocumentMetadata = {
      id: timestamp.toString(),
      name: file.name,
      filename: filename,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString(),
      category: category,
      status: 'draft',
      url: fileUrl,
      ...(base64Data ? { base64Data } : {})
    };
    
    // Add to metadata storage
    const metadata = await loadMetadata();
    metadata.unshift(documentMetadata);
    await saveMetadata(metadata);
    
    console.log('Document metadata saved successfully');
    
    // Return document info without the base64Data to reduce response size
    return NextResponse.json({
      success: true,
      document: {
        id: documentMetadata.id,
        name: documentMetadata.name,
        filename: documentMetadata.filename,
        size: documentMetadata.size,
        type: documentMetadata.type,
        uploadDate: documentMetadata.uploadDate,
        category: documentMetadata.category,
        status: documentMetadata.status,
        url: documentMetadata.url
      }
    });
  } catch (error) {
    console.error('Error handling file upload:', error);
    return NextResponse.json({ 
      error: 'Failed to process upload', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}