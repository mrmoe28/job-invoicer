import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { documentSignatures } from '@/lib/db-schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, signatureId, position, signer } = body;

    if (!documentId || !position || !position.signature) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate a unique ID for the signature if not provided
    const uniqueSignatureId = signatureId || crypto.randomUUID();

    // If we have an existing signature, update it
    if (signatureId) {
      await db.update(documentSignatures)
        .set({
          status: 'signed',
          signedAt: new Date(),
          signatureData: { position },
          updatedAt: new Date(),
        })
        .where(eq(documentSignatures.id, signatureId));
    } else {
      // Create a new signature record
      await db.insert(documentSignatures).values({
        id: uniqueSignatureId,
        documentId,
        signerEmail: signer?.email || 'guest@example.com',
        signerName: signer?.name || 'Guest Signer',
        status: 'signed',
        signedAt: new Date(),
        signatureData: { position },
        accessToken: crypto.randomBytes(32).toString('hex'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      signatureId: uniqueSignatureId,
    });
  } catch (error) {
    console.error('Error signing document:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sign document' },
      { status: 500 }
    );
  }
}
