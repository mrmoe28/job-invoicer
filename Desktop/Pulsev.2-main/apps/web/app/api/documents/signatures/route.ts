import { NextRequest, NextResponse } from 'next/server';
import { db } from '@pulsecrm/db';
import { documentSignatures, documents } from '@pulsecrm/db';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// POST /api/documents/signatures - Create signature request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      documentId,
      organizationId,
      signerName,
      signerEmail,
      signerRole,
      signerId,
      expiresInDays = 30,
    } = body;

    if (!documentId || !organizationId || !signerName || !signerEmail) {
      return NextResponse.json(
        { error: 'Document ID, organization ID, signer name, and email are required' },
        { status: 400 }
      );
    }

    // Verify document exists
    const [document] = await db
      .select()
      .from(documents)
      .where(and(
        eq(documents.id, documentId),
        eq(documents.organizationId, organizationId)
      ));

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Create signature request
    const [signature] = await db
      .insert(documentSignatures)
      .values({
        organizationId,
        documentId,
        signerId: signerId || undefined,
        signerName,
        signerEmail,
        signerRole,
        status: 'pending',
        expiredAt: expiresAt,
      })
      .returning();

    // Generate signing token (in production, this would be more secure)
    const signingToken = nanoid(32);

    // In production, you would:
    // 1. Save the signing token to database
    // 2. Send email with signing link
    // 3. Set up proper expiration handling

    const signingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign?token=${signingToken}`;

    return NextResponse.json({
      signature,
      signingUrl,
      message: 'Signature request created successfully',
    });

  } catch (error) {
    console.error('Error creating signature request:', error);
    return NextResponse.json(
      { error: 'Failed to create signature request' },
      { status: 500 }
    );
  }
}

// GET /api/documents/signatures - Get signatures for a document
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    const organizationId = searchParams.get('organizationId');

    if (!documentId || !organizationId) {
      return NextResponse.json(
        { error: 'Document ID and organization ID are required' },
        { status: 400 }
      );
    }

    const signatures = await db
      .select({
        id: documentSignatures.id,
        signerName: documentSignatures.signerName,
        signerEmail: documentSignatures.signerEmail,
        signerRole: documentSignatures.signerRole,
        status: documentSignatures.status,
        signedAt: documentSignatures.signedAt,
        createdAt: documentSignatures.createdAt,
      })
      .from(documentSignatures)
      .where(and(
        eq(documentSignatures.documentId, documentId),
        eq(documentSignatures.organizationId, organizationId)
      ));

    return NextResponse.json({ signatures });

  } catch (error) {
    console.error('Error fetching signatures:', error);
    return NextResponse.json(
      { error: 'Failed to fetch signatures' },
      { status: 500 }
    );
  }
}
