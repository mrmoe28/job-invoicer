import { NextRequest, NextResponse } from 'next/server';
import { db } from '@pulsecrm/db';
import { documents, documentSignatures } from '@pulsecrm/db';
import { eq, and, desc } from 'drizzle-orm';

// GET /api/documents - List all documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('organizationId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    let query = db
      .select({
        id: documents.id,
        fileName: documents.fileName,
        originalFileName: documents.originalFileName,
        title: documents.title,
        description: documents.description,
        fileType: documents.fileType,
        fileSize: documents.fileSize,
        category: documents.category,
        status: documents.status,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
      })
      .from(documents)
      .where(eq(documents.organizationId, orgId))
      .orderBy(desc(documents.createdAt));

    const allDocuments = await query;

    // Get signature information for each document
    const documentsWithSignatures = await Promise.all(
      allDocuments.map(async (doc) => {
        const signatures = await db
          .select({
            id: documentSignatures.id,
            signerName: documentSignatures.signerName,
            signerEmail: documentSignatures.signerEmail,
            signerRole: documentSignatures.signerRole,
            status: documentSignatures.status,
            signedAt: documentSignatures.signedAt,
          })
          .from(documentSignatures)
          .where(eq(documentSignatures.documentId, doc.id));

        return {
          ...doc,
          signatures,
          hasSignatures: signatures.length > 0,
        };
      })
    );

    // Apply filters
    let filteredDocuments = documentsWithSignatures;
    
    if (category && category !== 'all') {
      filteredDocuments = filteredDocuments.filter(doc => doc.category === category);
    }
    
    if (status && status !== 'all') {
      filteredDocuments = filteredDocuments.filter(doc => doc.status === status);
    }

    return NextResponse.json({
      documents: filteredDocuments,
      total: filteredDocuments.length,
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST /api/documents - Upload new document
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const organizationId = formData.get('organizationId') as string;
    const jobId = formData.get('jobId') as string | null;
    const contactId = formData.get('contactId') as string | null;
    const category = formData.get('category') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const uploadedByUserId = formData.get('uploadedByUserId') as string;

    if (!file || !organizationId || !uploadedByUserId) {
      return NextResponse.json(
        { error: 'File, organization ID, and uploader ID are required' },
        { status: 400 }
      );
    }

    // In production, you would upload to cloud storage (Vercel Blob, S3, etc.)
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `/uploads/${fileName}`;

    // Save document metadata to database
    const [newDocument] = await db
      .insert(documents)
      .values({
        organizationId,
        jobId: jobId || undefined,
        contactId: contactId || undefined,
        fileName,
        originalFileName: file.name,
        filePath,
        fileSize: file.size,
        mimeType: file.type,
        fileType: file.type.includes('pdf') ? 'pdf' : 'document',
        category,
        title,
        description,
        uploadedByUserId,
        status: 'active',
      })
      .returning();

    return NextResponse.json({
      document: newDocument,
      message: 'Document uploaded successfully',
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
