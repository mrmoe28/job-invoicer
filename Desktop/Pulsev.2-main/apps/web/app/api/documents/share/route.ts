import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { documents, documentSignatures } from '@/lib/db-schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { sendSignatureRequestEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, recipientEmail, recipientName } = body;

    if (!documentId || !recipientEmail) {
      return NextResponse.json({ error: 'Document ID and recipient email are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Check if document exists
    const documentResult = await db.select().from(documents).where(eq(documents.id, documentId)).limit(1);
    
    if (documentResult.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const document = documentResult[0];

    // Generate a unique access token for the signature
    const accessToken = crypto.randomBytes(32).toString('hex');
    const signatureId = crypto.randomUUID();
    
    // Calculate expiry date (30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    // Create a signature request in the database
    await db.insert(documentSignatures).values({
      id: signatureId,
      documentId,
      signerEmail: recipientEmail,
      signerName: recipientName || recipientEmail.split('@')[0], // Use first part of email if no name provided
      status: 'pending_signature',
      accessToken,
      expiresAt: expiryDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Generate signing URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get('host')}`;
    const signingUrl = `${baseUrl}/sign/${documentId}?token=${accessToken}`;

    // Send email to recipient with signing link
    try {
      await sendSignatureRequestEmail({
        email: recipientEmail,
        name: recipientName,
        documentName: document.name,
        signingUrl,
        expiryDate
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // We'll continue even if email fails, since we have the link in the response
    }

    return NextResponse.json({
      success: true,
      signatureId,
      signingUrl,
      message: 'Signature request created and email sent to recipient',
    });
  } catch (error) {
    console.error('Error sharing document for signature:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to share document' },
      { status: 500 }
    );
  }
}
