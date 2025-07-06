import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

// Create a simple file-based storage for documents metadata
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const DATA_DIR = path.join(process.cwd(), 'data');
const METADATA_FILE = path.join(DATA_DIR, 'documents-metadata.json');

interface DocumentMetadata {
  id: string;
  name: string;
  filename: string;
  size: number;
  type: string;
  uploadDate: string;
  category?: string;
  status?: string;
}

async function loadMetadata(): Promise<DocumentMetadata[]> {
  try {
    // Ensure data directory exists
    if (!existsSync(DATA_DIR)) {
      await mkdir(DATA_DIR, { recursive: true });
    }
    
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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    
    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Create document metadata
    const newDocument: DocumentMetadata = {
      id: timestamp.toString(),
      name: file.name,
      filename: filename,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString(),
      category: formData.get('category') as string || 'contracts',
      status: 'draft'
    };

    // Load existing metadata and add new document
    const metadata = await loadMetadata();
    metadata.unshift(newDocument);
    await saveMetadata(metadata);

    return NextResponse.json({
      success: true,
      document: {
        ...newDocument,
        url: `/uploads/${filename}`
      }
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const metadata = await loadMetadata();
    const documents = metadata.map(doc => ({
      ...doc,
      url: `/uploads/${doc.filename}`
    }));
    
    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}