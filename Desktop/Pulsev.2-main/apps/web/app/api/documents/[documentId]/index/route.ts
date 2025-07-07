import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { documents } from '@/lib/db-schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params;

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // Fetch the document
    const documentResult = await db.select().from(documents).where(eq(documents.id, documentId)).limit(1);
    
    if (documentResult.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const document = documentResult[0];

    // Create a URL for the document if it doesn't have one
    if (!document.url) {
      document.url = `/api/files/${document.path.split('/').pop()}`;
    }

    // Return basic document details
    return NextResponse.json({
      document: {
        id: document.id,
        name: document.name,
        type: document.type,
        url: document.url,
        createdAt: document.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch document details' },
      { status: 500 }
    );
  }
}
