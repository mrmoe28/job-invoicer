import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Constants
const DATA_DIR = path.join(process.cwd(), 'apps/web/data');
const DOCS_FILE = path.join(DATA_DIR, 'documents.json');

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
  uploadedBy?: string;
}

// Helper functions
async function getDocuments(): Promise<Document[]> {
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
  await writeFile(DOCS_FILE, JSON.stringify(documents, null, 2));
}

// DELETE - Remove a document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }
    
    // Load documents
    const documents = await getDocuments();
    
    // Find document
    const index = documents.findIndex(doc => doc.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    const document = documents[index];
    
    // If using blob storage, delete from there too
    if (document.url && 
        !document.url.startsWith('data:') && 
        process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        await del(document.url);
        console.log('Document deleted from blob storage:', document.url);
      } catch (error) {
        console.error('Error deleting from blob storage:', error);
        // Continue with metadata deletion even if blob delete fails
      }
    }
    
    // Remove from documents list
    documents.splice(index, 1);
    await saveDocuments(documents);
    
    console.log('Document deleted successfully:', {
      id: document.id,
      name: document.name
    });
    
    return NextResponse.json({ 
      success: true,
      message: `Document "${document.name}" deleted successfully`
    });
    
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}

// PATCH - Update document status or metadata
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const updates = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }
    
    // Load documents
    const documents = await getDocuments();
    
    // Find document
    const index = documents.findIndex(doc => doc.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    // Update document with provided fields
    const allowedUpdates = ['status', 'category', 'name'];
    const originalDocument = documents[index];
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        (documents[index] as any)[field] = updates[field];
      }
    });
    
    // Save updated documents
    await saveDocuments(documents);
    
    console.log('Document updated successfully:', {
      id: documents[index].id,
      name: documents[index].name,
      changes: updates
    });
    
    return NextResponse.json({ 
      success: true,
      document: documents[index],
      message: 'Document updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}
