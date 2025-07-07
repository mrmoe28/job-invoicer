import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Serves files that have been uploaded to the server
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    
    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }
    
    // Sanitize filename to prevent path traversal
    const sanitizedFilename = filename.replace(/\.\./g, '').replace(/[\/\\]/g, '');
    
    // Check multiple possible locations for the file
    const possiblePaths = [
      // Serverless /tmp path
      path.join('/tmp', 'uploads', sanitizedFilename),
      // Development public path
      path.join(process.cwd(), 'public', 'uploads', sanitizedFilename),
      // Another common location
      path.join(process.cwd(), 'uploads', sanitizedFilename),
    ];
    
    // Find the first path that exists
    let filePath = null;
    for (const p of possiblePaths) {
      if (existsSync(p)) {
        filePath = p;
        break;
      }
    }
    
    if (!filePath) {
      console.error(`File not found: ${sanitizedFilename}`);
      console.error('Checked paths:', possiblePaths);
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Read the file
    const fileBuffer = await fs.readFile(filePath);
    
    // Determine content type
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
    } else if (ext === '.doc' || ext === '.docx') {
      contentType = 'application/msword';
    }
    
    // Return the file
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${sanitizedFilename}"`,
        // Add cache control to improve performance
        'Cache-Control': 'public, max-age=86400',
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
