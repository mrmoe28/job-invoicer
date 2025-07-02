import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    // Validate filename to prevent directory traversal attacks
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    // Determine file path based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    const uploadDir = isProduction ? '/tmp/uploads' : path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadDir, filename);

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json({
        error: 'File not found',
        message: 'This file has not been uploaded to the server.'
      }, { status: 404 });
    }

    try {
      // Read the file
      const fileBuffer = await readFile(filePath);

      // Determine content type based on file extension
      const contentType = getContentType(filename);

      // Determine if file should be downloaded or displayed inline
      const isDownload = request.nextUrl.searchParams.get('download') === 'true';
      const disposition = isDownload ? 'attachment' : 'inline';

      // Get original filename from the stored filename (remove timestamp and random ID)
      const originalName = getOriginalFilename(filename);

      // Return the file with appropriate headers
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `${disposition}; filename="${originalName}"`,
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
          'Content-Length': fileBuffer.length.toString(),
        },
      });

    } catch (error) {
      console.error(`Error reading file ${filename}:`, error);
      return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
    }

  } catch (error) {
    console.error('File serving error:', error);
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
  }
}

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();

  const mimeTypes: { [key: string]: string } = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.csv': 'text/csv',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
  };

  return mimeTypes[ext] || 'application/octet-stream';
}

function getOriginalFilename(storedFilename: string): string {
  // Remove timestamp and random ID from stored filename
  // Format: timestamp_randomId_originalName
  const parts = storedFilename.split('_');
  if (parts.length >= 3) {
    return parts.slice(2).join('_'); // Join back in case original name had underscores
  }
  return storedFilename; // Fallback to stored filename
}


