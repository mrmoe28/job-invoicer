import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
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
  status: 'draft' | 'pending' | 'signed';
  uploadedBy?: string;
}

// GET - Retrieve all documents
export async function GET(request: NextRequest) {
  try {
    // Load documents
    let documents: Document[] = [];
    
    if (existsSync(DOCS_FILE)) {
      try {
        const data = await readFile(DOCS_FILE, 'utf-8');
        documents = JSON.parse(data);
      } catch (error) {
        console.error('Error reading documents file:', error);
        documents = [];
      }
    }
    
    // Get query parameters for filtering
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    
    // Apply filters
    let filteredDocs = documents;
    
    if (category) {
      filteredDocs = filteredDocs.filter(doc => doc.category === category);
    }
    
    if (status) {
      filteredDocs = filteredDocs.filter(doc => doc.status === status);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredDocs = filteredDocs.filter(doc => 
        doc.name.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by upload date (newest first)
    filteredDocs.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    
    return NextResponse.json({ 
      success: true,
      documents: filteredDocs,
      total: documents.length,
      filtered: filteredDocs.length
    });
    
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
