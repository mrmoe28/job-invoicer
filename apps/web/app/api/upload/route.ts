import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage';

// Configure upload settings
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
};

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

    // Validate file type
    if (!ALLOWED_FILE_TYPES[file.type]) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload using storage service
    const storage = new StorageService();
    const uploadResult = await storage.upload(buffer, file.name, file.type);
    
    // Return file information
    return NextResponse.json({
      success: true,
      file: {
        id: uploadResult.publicId,
        name: file.name,
        filename: uploadResult.publicId,
        size: uploadResult.size,
        type: uploadResult.type,
        url: uploadResult.url,
        provider: uploadResult.provider,
        uploadDate: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('id');
    
    if (!publicId) {
      return NextResponse.json(
        { error: 'No file ID provided' },
        { status: 400 }
      );
    }
    
    // Delete using storage service
    const storage = new StorageService();
    await storage.delete(publicId);
    
    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    );
  }
}