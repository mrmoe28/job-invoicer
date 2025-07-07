import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { documents, signaturePositions, documentSignatures } from '@/lib/db-schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params;
    const signatureId = request.nextUrl.searchParams.get('signatureId');

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // First check if the document exists
    const documentResult = await db.select().from(documents).where(eq(documents.id, documentId)).limit(1);
    
    if (documentResult.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Get signature positions for this document
    let positions = await db.select().from(signaturePositions).where(eq(signaturePositions.documentId, documentId));

    // If a signature ID is provided, also fetch existing signature data to show already signed positions
    if (signatureId) {
      const signatures = await db.select().from(documentSignatures)
        .where(
          and(
            eq(documentSignatures.documentId, documentId),
            eq(documentSignatures.id, signatureId)
          )
        );

      // Merge signature data with positions if available
      if (signatures.length > 0 && signatures[0].signatureData) {
        const signatureData = signatures[0].signatureData as any;
        
        // Map positions with signature data if available
        positions = positions.map(position => {
          // If we have signature data for this position, mark it as signed
          if (signatureData && signatureData.positions && signatureData.positions[position.id]) {
            return {
              ...position,
              signed: true,
              signature: signatureData.positions[position.id].signature
            };
          }
          return position;
        });
      }
    }

    // If no positions are defined yet, create default positions
    if (positions.length === 0) {
      // Create default positions for the document (e.g., bottom of page 1)
      const defaultPositions = [
        {
          page: 1,
          x: 100,
          y: 700,
          width: 200,
          height: 50,
          required: true,
          label: 'Signature',
        }
      ];

      return NextResponse.json({
        positions: defaultPositions.map((pos, index) => ({
          id: index,
          ...pos,
          signed: false,
        })),
      });
    }

    return NextResponse.json({
      positions: positions.map(pos => ({
        id: pos.id,
        page: pos.page,
        x: pos.x,
        y: pos.y,
        width: pos.width || 200,
        height: pos.height || 50,
        required: pos.required,
        label: pos.label || 'Signature',
        signed: pos.signed || false,
        signature: pos.signature || null,
      })),
    });
  } catch (error) {
    console.error('Error fetching signature positions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch signature positions' },
      { status: 500 }
    );
  }
}
