import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import crypto from 'crypto';

// Explicitly configure to handle FormData uploads
export const config = {
  api: {
    // Disable default body parser to handle files directly
    bodyParser: false,
    // Increase response size limit for larger files
    responseLimit: '10mb',
  },
};

/**
 * Simple document upload handler that doesn't rely on complex database or auth
 */
export async function POST(request: NextRequest) {
  console.log('Upload endpoint called');
  
  try {
    // Parse multipart form data manually
    let formData;
    try {
      formData = await request.formData();
      console.log('FormData parsed successfully');
    } catch (formError) {
      console.error('Error parsing FormData:', formError);
      return NextResponse.json(
        { 
          error: 'Failed to parse form data', 
          details: formError instanceof Error ? formError.message : 'Unknown error'
        },
        { status: 400 }
      );
    }
    
    // Get file from form data
    const file = formData.get('file');
    console.log('File received:', file ? 'yes' : 'no', typeof file);
    
    if (!file || !(file instanceof Blob)) {
      console.error('No valid file in request');
      return NextResponse.json({ error: 'No valid file uploaded' }, { status: 400 });
    }
    
    // Ensure filename is accessible 
    const fileName = file instanceof File ? file.name : 'unknown-file';
    console.log(`Processing file: ${fileName}`);
    
    // Generate unique ID and safe filename
    const id = crypto.randomUUID();
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${id}-${safeFileName}`;
    
    // Determine upload directory
    // In production use /tmp for serverless
    const isServerless = process.env.VERCEL === '1';
    const uploadDir = isServerless
      ? path.join('/tmp', 'uploads')
      : path.join(process.cwd(), 'public', 'uploads');
    
    console.log(`Upload directory: ${uploadDir}`);
    
    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      console.log('Creating upload directory');
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (mkdirError) {
        console.error('Error creating directory:', mkdirError);
        return NextResponse.json(
          { 
            error: 'Failed to create upload directory', 
            details: mkdirError instanceof Error ? mkdirError.message : 'Unknown error'
          },
          { status: 500 }
        );
      }
    }
    
    // Convert Blob to buffer and save
    try {
      const filePath = path.join(uploadDir, uniqueFileName);
      console.log(`Writing to: ${filePath}`);
      
      // Convert Blob to ArrayBuffer, then to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Write file to disk
      await writeFile(filePath, buffer);
      console.log(`File written successfully`);
      
      // Generate URL for the file
      const fileUrl = isServerless
        ? `/api/files/${uniqueFileName}`
        : `/uploads/${uniqueFileName}`;
      
      // Return success with file info
      return NextResponse.json({
        success: true,
        file: {
          id,
          originalName: fileName,
          filename: uniqueFileName,
          size: buffer.length,
          type: file instanceof File ? file.type : 'application/octet-stream',
          url: fileUrl,
        }
      });
    } catch (writeError) {
      console.error('Error writing file:', writeError);
      return NextResponse.json(
        { 
          error: 'Failed to save file', 
          details: writeError instanceof Error ? writeError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error during upload:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload document', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
