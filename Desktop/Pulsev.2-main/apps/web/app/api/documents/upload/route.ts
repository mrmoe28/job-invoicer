import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { documents } from '@/lib/db-schema';

// Configure Next.js to handle larger file uploads
export const config = {
  api: {
    bodyParser: false, // Disable the default body parser to handle larger files
    responseLimit: '8mb', // Increase response size limit for base64 data
  },
};

export async function POST(request: NextRequest) {
  console.log('Document upload API route called');
  
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('No file uploaded');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    console.log(`Uploading file: ${file.name} ${file.size}`);

    // Check file type and size
    if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
      console.error('Invalid file type', file.type);
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      console.error('File too large', file.size);
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    // Generate unique ID and filename
    const id = crypto.randomUUID();
    const fileName = `${id}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Create uploads directory if it doesn't exist
    const isProduction = process.env.NODE_ENV === 'production';
    const uploadDir = isProduction 
      ? path.join('/tmp', 'pulse-uploads') 
      : path.join(process.cwd(), 'public', 'uploads');
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, fileName);
    const fileUrl = isProduction 
      ? `/api/files/${fileName}` 
      : `/uploads/${fileName}`;
    
    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // In production, handle file saving differently if needed
    if (isProduction) {
      // If using Vercel Blob, uncomment this code:
      /*
      try {
        const { put } = await import('@vercel/blob');
        const blob = await put(fileName, buffer, {
          access: 'public',
        });
        fileUrl = blob.url;
      } catch (blobError) {
        console.error('Vercel Blob error:', blobError);
        // Fallback to local storage
        await writeFile(filePath, buffer);
      }
      */
      
      // For now, just save to /tmp in production
      await writeFile(filePath, buffer);
    } else {
      // In development, save to public/uploads
      await writeFile(filePath, buffer);
    }
    
    // Store file info in database using Drizzle
    try {
      // Check if db is properly initialized
      if (!db) {
        console.error('Database not initialized');
        throw new Error('Database not initialized');
      }
      
      const result = await db.insert(documents).values({
        id,
        name: file.name,
        type: file.type,
        size: file.size.toString(),
        path: filePath,
        url: fileUrl,
        organizationId: 'default-org', // Replace with actual org ID from auth
        userId: 'default-user', // Replace with actual user ID from auth
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log('Document saved to database', result);
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue anyway so the file is still saved
    }

    return NextResponse.json({
      success: true,
      file: {
        id,
        filename: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        url: fileUrl,
        uploadedAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
