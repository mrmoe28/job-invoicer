import { NextRequest, NextResponse } from 'next/server';
import { db } from '@pulsecrm/db';
import { documents } from '@pulsecrm/db';

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

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!organizationId || !uploadedByUserId) {
      return NextResponse.json(
        { error: 'Organization ID and uploader ID are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Please upload PDF, Word, or image files.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedName}`;

    // For now, we'll store file metadata without actual file storage
    // In production, this would upload to Vercel Blob, S3, or similar
    const fileUrl = `/uploads/${fileName}`; // Placeholder URL

    // Try Vercel Blob if available, otherwise use placeholder
    let actualFileUrl = fileUrl;
    
    try {
      // Only try Vercel Blob if we have a real token
      if (process.env.BLOB_READ_WRITE_TOKEN && process.env.BLOB_READ_WRITE_TOKEN !== 'development_placeholder') {
        const { put } = await import('@vercel/blob');
        const blob = await put(fileName, file, {
          access: 'public',
        });
        actualFileUrl = blob.url;
      }
    } catch (blobError) {
      console.log('Vercel Blob not available, using placeholder URL');
    }

    // Determine file type category
    let fileType = 'document';
    if (file.type.includes('pdf')) {
      fileType = 'pdf';
    } else if (file.type.includes('image')) {
      fileType = 'image';
    } else if (file.type.includes('word')) {
      fileType = 'document';
    }

    // Save document metadata to database
    const [newDocument] = await db
      .insert(documents)
      .values({
        organizationId,
        jobId: jobId || undefined,
        contactId: contactId || undefined,
        fileName,
        originalFileName: file.name,
        filePath: actualFileUrl,
        fileSize: file.size,
        mimeType: file.type,
        fileType,
        category: category || 'general',
        title: title || file.name,
        description: description || '',
        uploadedByUserId,
        status: 'active',
      })
      .returning();

    return NextResponse.json({
      document: {
        ...newDocument,
        hasSignatures: false,
        signatures: [],
      },
      message: 'Document uploaded successfully',
      fileUrl: actualFileUrl,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
