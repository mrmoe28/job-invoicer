# Neon File Storage Integration Guide

Based on [Neon's file storage recommendations](https://neon.com/docs/guides/file-storage), this guide outlines how to implement file storage for PulseCRM following best practices.

## Overview

Neon does not yet provide a native file storage solution. Instead, we recommend combining Neon with a specialized storage service.

The recommended pattern:
1. **Upload files** to an object storage provider or file management service
2. **Store references** (URLs, keys, identifiers) and metadata in your Neon PostgreSQL database

## Current Implementation

### Database Schema (Already Implemented)
```sql
-- documents table stores file metadata in Neon
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  job_id UUID,
  contact_id UUID,
  file_name VARCHAR(255) NOT NULL,
  original_file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,           -- Storage URL/path
  file_size BIGINT,
  mime_type VARCHAR(100),
  file_type VARCHAR(50),
  category VARCHAR(50),
  title VARCHAR(255),
  description TEXT,
  uploaded_by_user_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Current API Implementation
Location: `apps/web/app/api/documents/route.ts`

```typescript
// Current local storage implementation
const fileName = `${Date.now()}_${file.name}`;
const filePath = `/uploads/${fileName}`;

// Save metadata to Neon database
const [newDocument] = await db.insert(documents).values({
  organizationId,
  fileName,
  originalFileName: file.name,
  filePath,        // This will store the external URL
  fileSize: file.size,
  mimeType: file.type,
  // ... other metadata
}).returning();
```

## Recommended File Storage Options

### Option 1: Cloudflare R2 (Recommended)
**Why R2?** Zero egress fees, S3-compatible API, excellent performance

```bash
npm install @aws-sdk/client-s3
```

```typescript
// lib/storage/cloudflare-r2.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToR2(file: File, key: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  
  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  });

  await s3Client.send(command);
  
  // Return public URL
  return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
}
```

Environment variables:
```bash
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=pulsecrm-files
CLOUDFLARE_R2_PUBLIC_URL=https://files.your-domain.com
```

### Option 2: AWS S3
```bash
npm install @aws-sdk/client-s3
```

```typescript
// lib/storage/aws-s3.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(file: File, key: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  });

  await s3Client.send(command);
  
  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}
```

### Option 3: Uploadcare (Managed Service)
```bash
npm install @uploadcare/upload-client
```

```typescript
// lib/storage/uploadcare.ts
import { UploadClient } from '@uploadcare/upload-client';

const client = new UploadClient({
  publicKey: process.env.UPLOADCARE_PUBLIC_KEY!,
});

export async function uploadToUploadcare(file: File) {
  const result = await client.uploadFile(file);
  return result.cdnUrl; // Returns optimized CDN URL
}
```

## Updated Documents API Implementation

```typescript
// apps/web/app/api/documents/route.ts (updated)
import { uploadToR2 } from '@/lib/storage/cloudflare-r2';
// or import { uploadToS3 } from '@/lib/storage/aws-s3';
// or import { uploadToUploadcare } from '@/lib/storage/uploadcare';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const organizationId = formData.get('organizationId') as string;
    // ... other form data

    if (!file || !organizationId) {
      return NextResponse.json({ error: 'File and organization ID required' }, { status: 400 });
    }

    // Generate unique file key
    const fileKey = `${organizationId}/${Date.now()}_${file.name}`;
    
    // Upload to external storage
    const fileUrl = await uploadToR2(file, fileKey);
    // const fileUrl = await uploadToS3(file, fileKey);
    // const fileUrl = await uploadToUploadcare(file);

    // Save metadata to Neon database
    const [newDocument] = await db.insert(documents).values({
      organizationId,
      fileName: fileKey,
      originalFileName: file.name,
      filePath: fileUrl,        // External storage URL
      fileSize: file.size,
      mimeType: file.type,
      fileType: file.type.includes('pdf') ? 'pdf' : 'document',
      category,
      title,
      description,
      uploadedByUserId,
      status: 'active',
    }).returning();

    return NextResponse.json({
      document: newDocument,
      message: 'Document uploaded successfully',
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}
```

## Storage Provider Configuration

Create a unified storage interface:

```typescript
// lib/storage/index.ts
interface StorageProvider {
  upload(file: File, key: string): Promise<string>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}

class CloudflareR2Provider implements StorageProvider {
  async upload(file: File, key: string): Promise<string> {
    return await uploadToR2(file, key);
  }
  
  async delete(key: string): Promise<void> {
    // Implement R2 delete
  }
  
  getUrl(key: string): string {
    return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
  }
}

// Factory function
export function createStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER || 'r2';
  
  switch (provider) {
    case 'r2':
      return new CloudflareR2Provider();
    case 's3':
      return new AWSS3Provider();
    case 'uploadcare':
      return new UploadcareProvider();
    default:
      throw new Error(`Unsupported storage provider: ${provider}`);
  }
}
```

## Database Query Patterns

### Retrieve documents with file URLs
```typescript
// Get documents for a user
const userDocuments = await db
  .select({
    id: documents.id,
    title: documents.title,
    originalFileName: documents.originalFileName,
    fileUrl: documents.filePath,  // This contains the external URL
    fileSize: documents.fileSize,
    createdAt: documents.createdAt,
  })
  .from(documents)
  .where(eq(documents.organizationId, orgId))
  .orderBy(desc(documents.createdAt));
```

### File access control
```typescript
// Check if user can access file
const canAccess = await db
  .select({ id: documents.id })
  .from(documents)
  .innerJoin(organizations, eq(documents.organizationId, organizations.id))
  .innerJoin(users, eq(organizations.id, users.organizationId))
  .where(and(
    eq(documents.id, documentId),
    eq(users.id, userId)
  ));

if (canAccess.length > 0) {
  // User can access file, redirect to storage URL
  redirect(document.filePath);
}
```

## Migration Strategy

### Phase 1: Prepare Infrastructure
1. Choose storage provider (recommend Cloudflare R2)
2. Set up storage bucket/container
3. Configure environment variables
4. Test upload functionality

### Phase 2: Update API
1. Install storage client SDK
2. Update documents API route
3. Test file upload and retrieval

### Phase 3: Data Migration (if needed)
```typescript
// Migrate existing local files to external storage
const localDocuments = await db
  .select()
  .from(documents)
  .where(like(documents.filePath, '/uploads/%'));

for (const doc of localDocuments) {
  const localPath = path.join(process.cwd(), 'public', doc.filePath);
  const file = fs.readFileSync(localPath);
  
  const newUrl = await uploadToR2(file, doc.fileName);
  
  await db
    .update(documents)
    .set({ filePath: newUrl })
    .where(eq(documents.id, doc.id));
}
```

## Environment Variables Summary

Add to your Vercel environment variables:

```bash
# Storage Provider
STORAGE_PROVIDER=r2  # or 's3', 'uploadcare'

# Cloudflare R2
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=pulsecrm-files
CLOUDFLARE_R2_PUBLIC_URL=https://files.your-domain.com

# AWS S3 (alternative)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=pulsecrm-files

# Uploadcare (alternative)
UPLOADCARE_PUBLIC_KEY=your_public_key
UPLOADCARE_SECRET_KEY=your_secret_key
```

## Benefits of This Architecture

✅ **Scalability**: Purpose-built storage services handle files efficiently
✅ **Performance**: CDN delivery for fast file access
✅ **Cost-Effective**: Pay only for storage used, not for database storage
✅ **Reliability**: Multiple providers offer 99.9%+ uptime SLAs
✅ **Security**: Fine-grained access control via database + storage policies
✅ **Flexibility**: Easy to switch providers or use multiple providers

## Next Steps

1. **Choose Provider**: Recommend starting with Cloudflare R2 for cost-effectiveness
2. **Set Up Storage**: Create bucket and configure access keys
3. **Update Environment**: Add storage configuration to Vercel
4. **Deploy Changes**: Update API and test file uploads
5. **Monitor Usage**: Track storage costs and performance

This approach follows Neon's best practices and provides a robust, scalable file storage solution for PulseCRM.
