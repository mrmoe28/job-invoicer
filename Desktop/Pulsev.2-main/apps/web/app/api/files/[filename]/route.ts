import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    
    if (!filename) {
      return NextResponse.json(
        { error: 'No filename provided' },
        { status: 400 }
      );
    }
    
    // Sanitize filename to prevent path traversal
    const sanitizedFilename = filename.replace(/\.\./g, '').replace(/[\/\\]/g, '');
    
    // Check if file exists in production (/tmp) or development (public) directories
    const isProduction = process.env.NODE_ENV === 'production';
    const uploadsDir = isProduction 
      ? path.join('/tmp', 'pulse-uploads') 
      : path.join(process.cwd(), 'public', 'uploads');
    
    const filePath = path.join(uploadsDir, sanitizedFilename);
    
    // For development environment, check if file exists in public/uploads as fallback
    let fileBuffer;
    if (existsSync(filePath)) {
      fileBuffer = await fs.readFile(filePath);
    } else if (!isProduction) {
      // Try alternate path for dev environment
      const altPath = path.join(process.cwd(), 'public', 'uploads', sanitizedFilename);
      if (existsSync(altPath)) {
        fileBuffer = await fs.readFile(altPath);
      } else {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Determine content type based on file extension
    const ext = path.extname(sanitizedFilename).toLowerCase();
    let contentType = 'application/octet-stream'; // Default
    
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (['.jpg', '.jpeg'].includes(ext)) {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    } else if (ext === '.svg') {
      contentType = 'image/svg+xml';
    } else if (ext === '.webp') {
      contentType = 'image/webp';
    }
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${sanitizedFilename}"`,
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}
