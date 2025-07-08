import { NextRequest, NextResponse } from 'next/server';
import { db } from '@pulsecrm/db';
import { documents } from '@pulsecrm/db';

export async function POST(request: NextRequest) {
  console.log('📤 Upload API called');
  
  try {
    const formData = await request.formData();
    console.log('📋 FormData received:', Array.from(formData.entries()).map(([key, value]) => [key, value instanceof File ? `File: ${value.name}` : value]));
    
    const file = formData.get('file') as File;
    const organizationId = formData.get('organizationId') as string;
    const jobId = formData.get('jobId') as string | null;
    const contactId = formData.get('contactId') as string | null;
    const category = formData.get('category') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const uploadedByUserId = formData.get('uploadedByUserId') as string;

    console.log('📝 Parsed data:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      organizationId,
      category,
      title
    });

    if (!file) {
      console.error('❌ No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!organizationId || !uploadedByUserId) {
      console.error('❌ Missing required IDs:', { organizationId, uploadedByUserId });
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

    console.log('🔍 File type validation:', file.type, 'Allowed:', allowedTypes.includes(file.type));

    if (!allowedTypes.includes(file.type)) {
      console.error('❌ Invalid file type:', file.type);
      return NextResponse.json(
        { error: `File type not allowed: ${file.type}. Please upload PDF, Word, or image files.` },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.error('❌ File too large:', file.size);
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

    console.log('📁 Generated filename:', fileName);

    // For now, we'll store file metadata without actual file storage
    // In production, this would upload to Vercel Blob, S3, or similar
    const fileUrl = `/uploads/${fileName}`; // Placeholder URL

    // Try Vercel Blob if available, otherwise use placeholder
    let actualFileUrl = fileUrl;
    
    try {
      // Only try Vercel Blob if we have a real token
      if (process.env.BLOB_READ_WRITE_TOKEN && process.env.BLOB_READ_WRITE_TOKEN !== 'development_placeholder') {
        console.log('🌐 Attempting Vercel Blob upload...');
        const { put } = await import('@vercel/blob');
        const blob = await put(fileName, file, {
          access: 'public',
        });
        actualFileUrl = blob.url;
        console.log('✅ Vercel Blob upload successful:', actualFileUrl);
      } else {
        console.log('⚠️ Using placeholder URL (Vercel Blob not configured)');
      }
    } catch (blobError) {
      console.log('⚠️ Vercel Blob not available, using placeholder URL:', blobError);
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

    console.log('🏷️ File categorization:', { fileType, category });

    // Save document metadata to database
    console.log('💾 Saving to database...');
    
    const documentData = {
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
      status: 'active' as const,
    };

    console.log('📋 Document data to save:', documentData);

    const [newDocument] = await db
      .insert(documents)
      .values(documentData)
      .returning();

    console.log('✅ Document saved to database:', newDocument.id);

    const responseData = {
      document: {
        ...newDocument,
        hasSignatures: false,
        signatures: [],
      },
      message: 'Document uploaded successfully',
      fileUrl: actualFileUrl,
    };

    console.log('🎉 Upload successful, returning response');
    
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ Upload error details:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Failed to upload document',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
