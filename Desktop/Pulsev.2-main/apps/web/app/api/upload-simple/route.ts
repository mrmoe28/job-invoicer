import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('📤 Simple upload API called');
  
  try {
    const formData = await request.formData();
    console.log('📋 FormData received');
    
    const file = formData.get('file') as File;
    const organizationId = formData.get('organizationId') as string;
    const category = formData.get('category') as string;
    const title = formData.get('title') as string;

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
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedName}`;

    console.log('📁 Generated filename:', fileName);

    // For testing, return a mock document object instead of saving to database
    const mockDocument = {
      id: `doc_${timestamp}`,
      fileName,
      originalFileName: file.name,
      filePath: `/uploads/${fileName}`,
      fileSize: file.size,
      mimeType: file.type,
      fileType: file.type.includes('pdf') ? 'pdf' : 'document',
      category: category || 'general',
      title: title || file.name,
      description: 'Test upload via simple API',
      status: 'active',
      createdAt: new Date().toISOString(),
      uploadedBy: 'Test User',
      hasSignatures: false,
      signatures: [],
    };

    console.log('✅ Mock document created:', mockDocument.id);

    return NextResponse.json({
      document: mockDocument,
      message: 'Document uploaded successfully (test mode)',
      fileUrl: mockDocument.filePath,
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
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
