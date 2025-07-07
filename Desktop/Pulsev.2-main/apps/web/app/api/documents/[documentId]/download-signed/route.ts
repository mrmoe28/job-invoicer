import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { documents } from '@/lib/db-schema';
import { eq } from 'drizzle-orm';
import { promises as fs } from 'fs';
import path from 'path';
import { existsSync } from 'fs';

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
    
    // Check if a signed version exists
    const signedDocPath = path.join(process.cwd(), 'public', 'signed-documents', `signed-${documentId}.pdf`);
    const originalDocPath = path.join(process.cwd(), 'public', document.path.substring(1));
    
    let filePath;
    if (existsSync(signedDocPath)) {
      // Use signed version
      filePath = signedDocPath;
    } else if (existsSync(originalDocPath)) {
      // Fall back to original document
      filePath = originalDocPath;
    } else {
      return NextResponse.json({ error: 'Document file not found' }, { status: 404 });
    }

    // Read the file
    const fileBuffer = await fs.readFile(filePath);
    
    // Set appropriate headers for PDF download
    const fileName = document.name || `document-${documentId}.pdf`;
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error downloading signed document:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to download document' },
      { status: 500 }
    );
  }
}
