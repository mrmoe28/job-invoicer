# Vercel Blob Storage Implementation

## Overview
We've upgraded the document upload system to use Vercel Blob Storage for production deployments. This enables reliable file storage that works seamlessly with Vercel's serverless architecture.

## Key Changes

1. **Storage Strategy**
   - Development: Files are stored as base64 in the metadata JSON file
   - Production: Files are uploaded to Vercel Blob Storage with public access

2. **API Endpoints**
   - `/api/documents/upload`: Handles file uploads and metadata storage
   - `/api/documents/delete`: Deletes files from Vercel Blob and updates metadata

3. **Required Environment Variables**
   - `BLOB_READ_WRITE_TOKEN`: Required for Vercel Blob Storage operations

## Setting Up Vercel Blob

### 1. Get Vercel Blob Token
To set up Vercel Blob Storage:

1. Go to your Vercel project dashboard
2. Navigate to Storage > Blob
3. Create a new Blob store if you don't have one
4. Generate a new read/write token
5. Add the token to your environment variables:
   ```
   BLOB_READ_WRITE_TOKEN=your_token_here
   ```

### 2. Configure Vercel Environment Variables
Add the following to your Vercel project:

1. Go to Project Settings > Environment Variables
2. Add `BLOB_READ_WRITE_TOKEN` with your token value
3. Deploy your application to apply the changes

## Implementation Details

### Document Upload Process
1. User selects a PDF file through the UI
2. File is sent to `/api/documents/upload` endpoint
3. In development:
   - File is converted to base64 and stored in metadata
   - URL is set to `data:application/pdf;base64,...`
4. In production:
   - File is uploaded to Vercel Blob using `put()` function
   - URL is set to the Blob URL returned from Vercel
5. Metadata is updated with the file information and URL
6. UI displays the file in the documents list

### Document Deletion Process
1. User clicks delete button on a document
2. Request is sent to `/api/documents/delete?id=123` endpoint
3. Backend retrieves document metadata
4. If URL is a Vercel Blob URL (not base64), delete from Blob Storage
5. Remove document from metadata
6. Send success response to UI

## Benefits of Vercel Blob Storage

1. **Serverless Compatible**: Works with Vercel's serverless architecture
2. **Persistent Storage**: Files remain available across deployments
3. **High Performance**: Global CDN distribution for fast downloads
4. **Simple API**: Easy to implement with the `@vercel/blob` package
5. **Cost Effective**: Pay only for what you use

## Local Development

For local development, files are still stored as base64 in the metadata file, which simplifies the development workflow while maintaining feature parity with production.

## Testing the Implementation

1. Upload a PDF file through the UI
2. Verify the file appears in the document list
3. View the file to ensure it displays correctly
4. Delete the file and verify it's removed from the list
5. Deploy to Vercel and repeat the tests in production environment

## Maintenance Notes

- Periodically check Vercel Blob usage in the dashboard
- Consider implementing file size limits (currently set to 10MB per file)
- For larger applications, implement pagination for the document list
