import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import crypto from 'crypto';

// Simple upload API for testing purposes
// This does not depend on database or complex auth

export async function POST(request: NextRequest) {
  console.log('Test upload API called');
  
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('No file uploaded');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    console.log(`Test upload: ${file.name} (${file.size} bytes, ${file.type})`);

    // Generate unique ID and safe filename
    const id = crypto.randomUUID();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${id}-${safeFileName}`;
    
    // Create uploads directory in public folder
    const uploadsDir = path.join(process.cwd(), 'public', 'test-uploads');
    
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    
    // Write file to disk
    const filePath = path.join(uploadsDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);
    
    // Return success response with file info
    return NextResponse.json({
      success: true,
      file: {
        id,
        name: file.name,
        filename: fileName,
        size: file.size,
        type: file.type,
        url: `/test-uploads/${fileName}`,
        uploadedAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Test upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
