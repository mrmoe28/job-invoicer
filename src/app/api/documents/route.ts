import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { db } from '@/lib/drizzle-db';
import { documents } from '@/lib/schema';
import { desc } from 'drizzle-orm';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'public/uploads');

// Temporary user ID until proper auth is implemented
const TEMP_USER_ID = 'temp-user-123';

export async function GET() {
  try {
    // Fetch all documents for now (until auth is implemented)
    const documentsList = await db
      .select()
      .from(documents)
      .orderBy(desc(documents.createdAt));

    // Transform the data for the frontend
    const transformedDocuments = documentsList.map((doc) => ({
      id: doc.id,
      name: doc.name,
      fileUrl: doc.fileUrl,
      uploadedBy: doc.uploadedBy,
      uploadedAt: new Date(doc.uploadedAt).toLocaleString(),
      status: doc.status,
      signers: [] // We'll add signer fetching later
    }));

    return NextResponse.json({
      documents: transformedDocuments,
      total: transformedDocuments.length
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Create unique filename
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(uploadDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Create document record in database
    const [newDocument] = await db
      .insert(documents)
      .values({
        name: file.name,
        fileUrl: `/uploads/${filename}`,
        uploadedBy: TEMP_USER_ID, // Using temp user ID for now
        status: 'draft',
        metadata: {
          originalName: file.name,
          size: file.size,
          mimeType: file.type
        }
      })
      .returning();

    return NextResponse.json({
      document: {
        id: newDocument.id,
        name: newDocument.name,
        fileUrl: newDocument.fileUrl,
        uploadedBy: newDocument.uploadedBy,
        uploadedAt: new Date(newDocument.uploadedAt).toLocaleString(),
        status: newDocument.status,
        signers: []
      },
      message: 'Document uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
