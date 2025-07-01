import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadedFiles = [];
    
    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ 
          error: `File ${file.name} is too large. Maximum size is 10MB.` 
        }, { status: 400 });
      }

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ 
          error: `File type ${file.type} is not allowed.` 
        }, { status: 400 });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = path.extname(file.name);
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFileName = `${timestamp}_${randomId}_${safeName}`;

      try {
        // In production (Vercel), store files in /tmp directory
        // In development, store in local uploads directory
        const isProduction = process.env.NODE_ENV === 'production';
        const uploadDir = isProduction ? '/tmp/uploads' : path.join(process.cwd(), 'uploads');
        
        // Ensure upload directory exists
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, uniqueFileName);
        
        // Convert File to Buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Create file metadata
        const fileData = {
          id: `${timestamp}_${randomId}`,
          originalName: file.name,
          fileName: uniqueFileName,
          mimeType: file.type,
          size: file.size,
          uploadPath: isProduction ? `/tmp/uploads/${uniqueFileName}` : `/uploads/${uniqueFileName}`,
          url: `/api/files/${uniqueFileName}`,
          createdAt: new Date().toISOString(),
        };

        uploadedFiles.push(fileData);
        
      } catch (error) {
        console.error(`Error saving file ${file.name}:`, error);
        return NextResponse.json({ 
          error: `Failed to save file ${file.name}` 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      files: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to process file upload' 
    }, { status: 500 });
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
