import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v2 as cloudinary } from 'cloudinary';

// Storage provider types
export type StorageProvider = 's3' | 'cloudinary' | 'local';

// Storage configuration
export interface StorageConfig {
  provider: StorageProvider;
  s3?: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucket: string;
  };
  cloudinary?: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
}

// File upload result
export interface UploadResult {
  url: string;
  publicId: string;
  size: number;
  type: string;
  provider: StorageProvider;
}

// Initialize storage based on environment
export function getStorageConfig(): StorageConfig {
  const provider = (process.env.STORAGE_PROVIDER || 'local') as StorageProvider;
  
  const config: StorageConfig = { provider };
  
  if (provider === 's3') {
    config.s3 = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      region: process.env.AWS_REGION || 'us-east-1',
      bucket: process.env.S3_BUCKET_NAME!,
    };
  } else if (provider === 'cloudinary') {
    config.cloudinary = {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
      apiKey: process.env.CLOUDINARY_API_KEY!,
      apiSecret: process.env.CLOUDINARY_API_SECRET!,
    };
    
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
    });
  }
  
  return config;
}

// S3 Storage Handler
export class S3Storage {
  private client: S3Client;
  private bucket: string;
  
  constructor(config: StorageConfig['s3']) {
    if (!config) throw new Error('S3 configuration required');
    
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.bucket = config.bucket;
  }
  
  async upload(file: Buffer, filename: string, mimeType: string): Promise<UploadResult> {
    const key = `documents/${Date.now()}-${filename}`;
    
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: mimeType,
    });
    
    await this.client.send(command);
    
    // Generate signed URL (valid for 7 days)
    const url = await getSignedUrl(this.client, command, { expiresIn: 604800 });
    
    return {
      url,
      publicId: key,
      size: file.length,
      type: mimeType,
      provider: 's3',
    };
  }
  
  async delete(publicId: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: publicId,
    });
    
    await this.client.send(command);
  }
}

// Cloudinary Storage Handler
export class CloudinaryStorage {
  async upload(file: Buffer, filename: string, mimeType: string): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'documents',
          public_id: `${Date.now()}-${filename.replace(/\.[^/.]+$/, '')}`,
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              size: result.bytes,
              type: mimeType,
              provider: 'cloudinary',
            });
          }
        }
      );
      
      uploadStream.end(file);
    });
  }
  
  async delete(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}

// Local Storage Handler (existing functionality)
export class LocalStorage {
  async upload(file: Buffer, filename: string, mimeType: string): Promise<UploadResult> {
    const { writeFile, mkdir } = await import('fs/promises');
    const { existsSync } = await import('fs');
    const path = await import('path');
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    const uniqueFilename = `${Date.now()}-${filename}`;
    const filePath = path.join(uploadDir, uniqueFilename);
    await writeFile(filePath, file);
    
    return {
      url: `/uploads/${uniqueFilename}`,
      publicId: uniqueFilename,
      size: file.length,
      type: mimeType,
      provider: 'local',
    };
  }
  
  async delete(publicId: string): Promise<void> {
    const { unlink } = await import('fs/promises');
    const path = await import('path');
    
    const filePath = path.join(process.cwd(), 'public', 'uploads', publicId);
    await unlink(filePath);
  }
}

// Unified Storage Interface
export class StorageService {
  private storage: S3Storage | CloudinaryStorage | LocalStorage;
  private config: StorageConfig;
  
  constructor() {
    this.config = getStorageConfig();
    
    switch (this.config.provider) {
      case 's3':
        this.storage = new S3Storage(this.config.s3);
        break;
      case 'cloudinary':
        this.storage = new CloudinaryStorage();
        break;
      default:
        this.storage = new LocalStorage();
    }
  }
  
  async upload(file: Buffer, filename: string, mimeType: string): Promise<UploadResult> {
    return this.storage.upload(file, filename, mimeType);
  }
  
  async delete(publicId: string): Promise<void> {
    return this.storage.delete(publicId);
  }
  
  getProvider(): StorageProvider {
    return this.config.provider;
  }
}