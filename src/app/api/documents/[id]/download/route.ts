import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle-db';
import { documents, signatureFields } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { PDFDocument } from 'pdf-lib';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;

    // Get document details
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Get all signatures for this document
    const signatures = await db
      .select({
        page: signatureFields.page,
        x: signatureFields.x,
        y: signatureFields.y,
        width: signatureFields.width,
        height: signatureFields.height,
        value: signatureFields.value
      })
      .from(signatureFields)
      .where(eq(signatureFields.documentId, documentId));

    // Load the original PDF
    const pdfPath = path.join(process.cwd(), 'public', document.fileUrl);
    const existingPdfBytes = await readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Add signatures to the PDF
    for (const signature of signatures) {
      const pages = pdfDoc.getPages();
      const page = pages[signature.page - 1]; // Pages are 0-indexed

      if (page && signature.value) {
        try {
          // Convert base64 signature to image
          const signatureImage = await pdfDoc.embedPng(signature.value);

          // Draw the signature on the page
          page.drawImage(signatureImage, {
            x: signature.x,
            y: page.getHeight() - signature.y - signature.height, // PDF coordinates are bottom-up
            width: signature.width,
            height: signature.height,
          });
        } catch (error) {
          console.error('Error embedding signature:', error);
          // Continue with other signatures if one fails
        }
      }
    }

    // Generate the signed PDF
    const signedPdfBytes = await pdfDoc.save();

    // Return the signed PDF as a download
    return new NextResponse(Buffer.from(signedPdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${document.name.replace('.pdf', '')}-signed.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating signed PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate signed PDF' },
      { status: 500 }
    );
  }
}
