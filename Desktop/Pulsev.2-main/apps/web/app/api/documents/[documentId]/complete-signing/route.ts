import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { documentSignatures, documents } from '@/lib/db-schema';
import { eq, and } from 'drizzle-orm';
import { PDFDocument } from 'pdf-lib';
import { promises as fs } from 'fs';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params;
    const body = await request.json();
    const { signatureId } = body;

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // Fetch the document
    const documentResult = await db.select().from(documents).where(eq(documents.id, documentId)).limit(1);
    
    if (documentResult.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const document = documentResult[0];

    // Fetch the signature
    if (signatureId) {
      const signatureResult = await db.select().from(documentSignatures)
        .where(
          and(
            eq(documentSignatures.documentId, documentId),
            eq(documentSignatures.id, signatureId)
          )
        )
        .limit(1);

      if (signatureResult.length > 0) {
        // Update the signature status
        await db.update(documentSignatures)
          .set({
            status: 'signed',
            updatedAt: new Date(),
          })
          .where(eq(documentSignatures.id, signatureId));
      }
    }

    // Get all signatures for this document
    const allSignatures = await db.select().from(documentSignatures)
      .where(eq(documentSignatures.documentId, documentId));

    // Check if all required signatures are complete
    const requiredSignatureCount = 1; // This should be determined by your application logic
    const completedSignatureCount = allSignatures.filter(sig => sig.status === 'signed').length;

    if (completedSignatureCount >= requiredSignatureCount) {
      // All required signatures are complete, update document status
      // You would need to add a status field to your documents table for this
      // await db.update(documents)
      //   .set({ status: 'signed' })
      //   .where(eq(documents.id, documentId));

      // Generate final signed PDF (this is a placeholder for the actual implementation)
      await generateSignedPDF(document, allSignatures);
    }

    return NextResponse.json({
      success: true,
      allSignaturesComplete: completedSignatureCount >= requiredSignatureCount,
    });
  } catch (error) {
    console.error('Error completing document signing:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to complete document signing' },
      { status: 500 }
    );
  }
}

// Function to generate the final signed PDF
async function generateSignedPDF(document: any, signatures: any[]) {
  try {
    // Verify document path
    let documentPath = document.path;
    
    // If path starts with a slash and we're using public directory, prepend process.cwd()
    if (documentPath.startsWith('/') && !documentPath.startsWith('/tmp')) {
      documentPath = path.join(process.cwd(), 'public', documentPath.substring(1));
    }

    // Check if file exists
    if (!existsSync(documentPath)) {
      console.error(`Document file not found at path: ${documentPath}`);
      return;
    }

    // Read the original PDF
    const pdfBytes = await fs.readFile(documentPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // For each signature, embed the signature image into the PDF
    for (const signature of signatures) {
      if (signature.status !== 'signed' || !signature.signatureData) continue;
      
      const signatureData = signature.signatureData as any;
      
      // If we have position data for this signature
      if (signatureData.position) {
        const { page, x, y, signature: signatureImage } = signatureData.position;
        
        if (!signatureImage) continue;
        
        // Convert data URL to bytes
        const signatureImageData = signatureImage.split(',')[1];
        if (!signatureImageData) continue;
        
        const signatureBytes = Buffer.from(signatureImageData, 'base64');
        
        // Embed the image in the PDF
        const signatureImageEmbed = await pdfDoc.embedPng(signatureBytes);
        
        // Get the page
        const pdfPage = pdfDoc.getPages()[page - 1]; // Page is 1-indexed, array is 0-indexed
        if (!pdfPage) continue;
        
        // Calculate dimensions based on the size in the position data
        const width = 200; // Default width
        const height = 50; // Default height
        
        // Draw the signature on the page
        pdfPage.drawImage(signatureImageEmbed, {
          x,
          y: pdfPage.getHeight() - y - height, // PDF coordinates are bottom-left origin
          width,
          height,
        });
      }
    }
    
    // Serialize the PDFDocument to bytes
    const signedPdfBytes = await pdfDoc.save();
    
    // Create directory for signed documents if it doesn't exist
    const signedDocsDir = path.join(process.cwd(), 'public', 'signed-documents');
    if (!existsSync(signedDocsDir)) {
      await fs.mkdir(signedDocsDir, { recursive: true });
    }
    
    // Save the signed PDF
    const signedDocPath = path.join(signedDocsDir, `signed-${document.id}.pdf`);
    await fs.writeFile(signedDocPath, signedPdfBytes);
    
    // Optionally, update the document in the database with the path to the signed version
    // await db.update(documents)
    //   .set({ signedPath: `/signed-documents/signed-${document.id}.pdf` })
    //   .where(eq(documents.id, document.id));
    
    console.log(`Signed document saved to: ${signedDocPath}`);
  } catch (error) {
    console.error('Error generating signed PDF:', error);
    throw error;
  }
}
