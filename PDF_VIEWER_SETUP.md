# PDF Viewer Setup Guide

## Overview
We've implemented two PDF viewer options that work reliably with Vercel deployment:

### 1. React-PDF Viewer (Recommended)
- Full-featured PDF viewer with navigation, zoom, and text selection
- Works reliably on Vercel with CDN-hosted worker
- Better for viewing complex PDFs with annotations

### 2. Inline PDF Viewer
- Uses browser's native PDF rendering
- Simpler implementation, fewer dependencies
- Good for basic PDF viewing needs

## Implementation

### Using React-PDF Viewer

```tsx
import dynamic from 'next/dynamic';

const PDFViewer = dynamic(() => import('@/components/PDFViewer'), {
  ssr: false,
  loading: () => <div>Loading PDF viewer...</div>
});

// In your component
const [selectedPdf, setSelectedPdf] = useState(null);

<PDFViewer
  url="/path/to/document.pdf"
  title="My Document"
  onClose={() => setSelectedPdf(null)}
/>
```

### Using Inline PDF Viewer

```tsx
import InlinePDFViewer from '@/components/InlinePDFViewer';

<InlinePDFViewer
  url="/path/to/document.pdf"
  title="My Document"
  height="600px"
  onClose={() => setShowPdf(false)}
/>
```

## Key Features

### React-PDF Viewer
- Page navigation (previous/next)
- Zoom controls (50% - 300%)
- Text selection and search
- Download option
- Fullscreen modal view
- Loading states and error handling
- Mobile responsive

### Inline PDF Viewer
- Native browser rendering
- Fullscreen toggle
- Download option
- Simpler implementation
- Better for embedded viewing

## Vercel Deployment Considerations

### 1. PDF.js Worker Configuration
The React-PDF viewer uses a CDN-hosted worker to avoid build issues:
```javascript
pdfjs.GlobalWorkerOptions.workerSrc = 
  `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
```

### 2. Dynamic Imports
Always use dynamic imports for PDF components to avoid SSR issues:
```tsx
const PDFViewer = dynamic(() => import('@/components/PDFViewer'), {
  ssr: false
});
```

### 3. CORS Configuration
For PDFs hosted externally, ensure proper CORS headers:
```javascript
// In next.config.js
async headers() {
  return [
    {
      source: '/api/files/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
      ],
    },
  ];
}
```

## File Storage Options

### 1. Public Folder (Simple)
Place PDFs in `public/documents/`:
```
public/
  documents/
    contract.pdf
    invoice.pdf
```
Access via: `/documents/contract.pdf`

### 2. API Route (Secure)
Create an API route for authenticated access:
```typescript
// app/api/files/[...path]/route.ts
export async function GET(request: Request) {
  // Check authentication
  // Stream file from secure storage
}
```

### 3. External Storage (Recommended for Production)
Use services like:
- AWS S3
- Cloudinary
- Vercel Blob Storage
- Supabase Storage

## Troubleshooting

### Common Issues

1. **PDF not loading**
   - Check CORS headers
   - Verify file path/URL
   - Check console for errors

2. **Worker errors**
   - Ensure CDN URL is accessible
   - Check for content security policy issues

3. **Large PDFs**
   - Consider implementing lazy loading
   - Use streaming for better performance

### Performance Tips

1. **Optimize PDFs**
   - Compress PDFs before uploading
   - Use tools like Ghostscript or online compressors

2. **Lazy Loading**
   - Load PDF viewer only when needed
   - Use dynamic imports

3. **Caching**
   - Implement proper cache headers
   - Use CDN for static PDFs

## Next Steps

1. **Choose Storage Solution**
   - Decide where to store PDFs (public, API, external)

2. **Implement Authentication**
   - Add access control for sensitive documents

3. **Add Upload Functionality**
   - Create upload component
   - Handle file validation

4. **Monitor Performance**
   - Track loading times in Vercel Analytics
   - Optimize based on usage patterns