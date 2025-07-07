# Document E-Signature Feature for Pulse CRM

This document outlines the implementation of the e-signature feature for solar contract documents in Pulse CRM.

## Overview

The e-signature feature allows Pulse CRM users to:

1. Upload PDF documents (contracts, agreements, etc.)
2. Sign documents directly within the application
3. Request signatures from clients and partners via email
4. Track signature status and download signed documents

## Key Components

### Frontend Components

- `EnhancedSolarDocumentManager`: Main UI for the documents page with document listing, upload, and signature features
- `EnhancedDocumentViewer`: PDF viewer with signature functionality
- `DocumentSignature`: Component for signing documents with drawing or typing signatures
- `SignDocumentView`: External page for clients to sign documents via a shared link

### API Routes

- `/api/documents/sign`: API route to save signatures for documents
- `/api/documents/[documentId]/signature-positions`: Retrieves signature positions for a document
- `/api/documents/[documentId]/complete-signing`: Completes the signing process and generates the final signed PDF
- `/api/documents/[documentId]/download-signed`: Downloads the signed document
- `/api/documents/share`: Sends signature requests to recipients via email

### Database Schema

```typescript
// Document system tables
export const documents = pgTable('documents', {
  id: varchar('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  size: text('size').notNull(),
  path: text('path').notNull(),
  url: text('url').notNull(),
  organizationId: varchar('organization_id')
    .notNull()
    .references(() => organizations.id),
  userId: varchar('user_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Document status enum
export const documentStatusEnum = pgEnum('document_status', [
  'draft',
  'pending_signature',
  'signed',
  'rejected',
  'expired',
]);

// Document signatures table
export const documentSignatures = pgTable('document_signatures', {
  id: varchar('id').primaryKey(),
  documentId: varchar('document_id')
    .notNull()
    .references(() => documents.id),
  signerEmail: varchar('signer_email').notNull(),
  signerName: varchar('signer_name').notNull(),
  status: documentStatusEnum('status').notNull().default('pending_signature'),
  signedAt: timestamp('signed_at'),
  expiresAt: timestamp('expires_at'),
  signatureData: json('signature_data'),
  accessToken: varchar('access_token').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Signature positions for documents
export const signaturePositions = pgTable('signature_positions', {
  id: serial('id').primaryKey(),
  documentId: varchar('document_id')
    .notNull()
    .references(() => documents.id),
  signatureId: varchar('signature_id')
    .references(() => documentSignatures.id),
  page: integer('page').notNull(),
  x: integer('x').notNull(),
  y: integer('y').notNull(),
  width: integer('width').notNull().default(200),
  height: integer('height').notNull().default(50),
  required: boolean('required').notNull().default(true),
  label: text('label'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

## Signature Flow

1. **Document Upload**: User uploads a PDF document through the `EnhancedSolarDocumentManager` component
2. **Self-Signing**: User clicks "Sign Document" in the document viewer to add their own signature
3. **Request Signature**: User can send signature requests to clients or partners
4. **External Signing**: Recipients receive an email with a link to sign the document
5. **Signature Completion**: All parties complete their signatures and receive notification
6. **Final Document**: The signed document is available for download and is stored securely

## Security Features

- Secure access tokens for signature links
- Email validation for signature requests
- Expiration dates for signature requests (30 days by default)
- Signature verification and timestamping
- Audit trail of all signature activities

## Dependencies

- `pdf-lib`: For PDF manipulation and signature embedding
- `@react-pdf-viewer/core`: For PDF viewing in the browser
- `react-draggable`: For draggable signature placement
- `resend`: For production email sending (configurable via environment variables)

## Environment Variables

- `DATABASE_URL`: Connection string for PostgreSQL database
- `NEXT_PUBLIC_APP_URL`: Base URL of the application for generating signature links
- `RESEND_API_KEY`: API key for Resend email service (optional, used in production)
- `EMAIL_FROM`: From address for emails (defaults to 'noreply@pulsecrm.com')

## Deployment Notes

The e-signature feature is designed to work with Vercel deployment. For non-Vercel deployments, ensure that the appropriate environment variables are set and that the database is properly configured.

## Future Enhancements

- Multi-signer workflows with specific signing order
- Template-based documents with predefined signature fields
- Integration with digital signature providers for enhanced legal validity
- Mobile app support for signing on the go
- Bulk signature requests for multiple documents
