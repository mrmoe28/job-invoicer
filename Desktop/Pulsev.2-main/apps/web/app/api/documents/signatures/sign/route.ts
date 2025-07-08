import { NextRequest, NextResponse } from 'next/server';
import { db } from '@pulsecrm/db';
import { documentSignatures } from '@pulsecrm/db';
import { eq, and } from 'drizzle-orm';

// POST /api/documents/signatures/sign - Complete signature
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      signatureId,
      signatureData,
      signatureType,
      ipAddress,
      userAgent,
    } = body;

    if (!signatureId || !signatureData || !signatureType) {
      return NextResponse.json(
        { error: 'Signature ID, data, and type are required' },
        { status: 400 }
      );
    }

    // Update signature with completion data
    const [updatedSignature] = await db
      .update(documentSignatures)
      .set({
        signatureData,
        signatureType,
        status: 'signed',
        signedAt: new Date(),
        ipAddress,
        userAgent,
        updatedAt: new Date(),
      })
      .where(eq(documentSignatures.id, signatureId))
      .returning();

    if (!updatedSignature) {
      return NextResponse.json(
        { error: 'Signature not found' },
        { status: 404 }
      );
    }

    // In production, you would:
    // 1. Send confirmation email to signer
    // 2. Notify document owner
    // 3. Generate signed PDF
    // 4. Store audit trail

    return NextResponse.json({
      signature: updatedSignature,
      message: 'Document signed successfully',
    });

  } catch (error) {
    console.error('Error completing signature:', error);
    return NextResponse.json(
      { error: 'Failed to complete signature' },
      { status: 500 }
    );
  }
}

// PUT /api/documents/signatures/sign - Decline signature
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      signatureId,
      declineReason,
    } = body;

    if (!signatureId) {
      return NextResponse.json(
        { error: 'Signature ID is required' },
        { status: 400 }
      );
    }

    // Update signature as declined
    const [updatedSignature] = await db
      .update(documentSignatures)
      .set({
        status: 'declined',
        declinedAt: new Date(),
        declineReason,
        updatedAt: new Date(),
      })
      .where(eq(documentSignatures.id, signatureId))
      .returning();

    if (!updatedSignature) {
      return NextResponse.json(
        { error: 'Signature not found' },
        { status: 404 }
      );
    }

    // In production, you would:
    // 1. Send notification email to document owner
    // 2. Log the decline reason
    // 3. Update document status if needed

    return NextResponse.json({
      signature: updatedSignature,
      message: 'Signature declined',
    });

  } catch (error) {
    console.error('Error declining signature:', error);
    return NextResponse.json(
      { error: 'Failed to decline signature' },
      { status: 500 }
    );
  }
}
