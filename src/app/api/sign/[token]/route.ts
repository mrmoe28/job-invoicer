import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle-db';
import { signers, documents, signatureFields } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // Find signer by token
    const [signer] = await db
      .select()
      .from(signers)
      .where(eq(signers.emailToken, token))
      .limit(1);

    if (!signer) {
      return NextResponse.json(
        { error: 'Invalid signing token' },
        { status: 404 }
      );
    }

    // Check if token is expired
    if (signer.tokenExpiry && new Date() > signer.tokenExpiry) {
      return NextResponse.json(
        { error: 'Signing link has expired' },
        { status: 400 }
      );
    }

    // Get document details
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, signer.documentId))
      .limit(1);

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      document: {
        id: document.id,
        name: document.name,
        fileUrl: document.fileUrl
      },
      signer: {
        id: signer.id,
        name: signer.name,
        email: signer.email,
        status: signer.status
      }
    });
  } catch (error) {
    console.error('Error fetching signing session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch signing session' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const body = await request.json();
    const { signatureData, position } = body;

    // Find signer by token
    const [signer] = await db
      .select()
      .from(signers)
      .where(eq(signers.emailToken, token))
      .limit(1);

    if (!signer) {
      return NextResponse.json(
        { error: 'Invalid signing token' },
        { status: 404 }
      );
    }

    // Check if already signed
    if (signer.status === 'signed') {
      return NextResponse.json(
        { error: 'Document already signed' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (signer.tokenExpiry && new Date() > signer.tokenExpiry) {
      return NextResponse.json(
        { error: 'Signing link has expired' },
        { status: 400 }
      );
    }

    // Create signature field
    await db
      .insert(signatureFields)
      .values({
        documentId: signer.documentId,
        signerId: signer.id,
        page: position.page,
        x: position.x,
        y: position.y,
        width: 200,
        height: 80,
        type: 'signature',
        value: signatureData,
        required: true
      });

    // Update signer status
    await db
      .update(signers)
      .set({
        status: 'signed',
        signedAt: new Date(),
        signatureData,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      })
      .where(eq(signers.id, signer.id));

    // Check if all signers have signed
    const allSigners = await db
      .select()
      .from(signers)
      .where(eq(signers.documentId, signer.documentId));

    const allSigned = allSigners.every(s => s.status === 'signed');

    if (allSigned) {
      // Update document status
      await db
        .update(documents)
        .set({
          status: 'completed',
          completedAt: new Date()
        })
        .where(eq(documents.id, signer.documentId));
    }

    return NextResponse.json({
      message: 'Document signed successfully',
      documentCompleted: allSigned
    });
  } catch (error) {
    console.error('Error signing document:', error);
    return NextResponse.json(
      { error: 'Failed to sign document' },
      { status: 500 }
    );
  }
}
