export type DocumentType = 
  | 'contract'
  | 'proposal'
  | 'permit'
  | 'invoice'
  | 'receipt'
  | 'warranty'
  | 'installation_guide'
  | 'maintenance_record'
  | 'inspection_report'
  | 'photo'
  | 'other';

export type DocumentStatus = 
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'pending_signature'
  | 'signed'
  | 'rejected'
  | 'expired'
  | 'archived';

export interface DocumentMetadata {
  title: string;
  description?: string;
  tags: string[];
  category: string;
  version: number;
  isTemplate: boolean;
  customFields?: Record<string, any>;
}

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  metadata: DocumentMetadata;
  file: {
    originalName: string;
    size: number;
    mimeType: string;
    path: string;
    url: string;
    checksum?: string;
  };
  organizationId: string;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Related entities
  customerId?: string;
  contractorId?: string;
  projectId?: string;
  
  // Signature workflow
  requiresSignature: boolean;
  signatureWorkflow?: SignatureWorkflow;
  
  // Access control
  visibility: 'public' | 'private' | 'organization';
  permissions: DocumentPermission[];
  
  // Version control
  parentDocumentId?: string;
  versionHistory: DocumentVersion[];
}

export interface SignatureWorkflow {
  id: string;
  documentId: string;
  signers: Signer[];
  workflow: 'sequential' | 'parallel';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  reminderSchedule: ReminderSettings;
  expirationDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Signer {
  id: string;
  email: string;
  name: string;
  role: string;
  order?: number; // For sequential workflows
  status: 'pending' | 'sent' | 'viewed' | 'signed' | 'declined';
  accessToken: string;
  signedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  signatureData?: SignatureData;
}

export interface SignatureData {
  type: 'drawn' | 'typed' | 'uploaded';
  data: string; // Base64 encoded signature
  position: SignaturePosition;
  timestamp: Date;
}

export interface SignaturePosition {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ReminderSettings {
  enabled: boolean;
  initialDelay: number; // hours
  frequency: number; // hours
  maxReminders: number;
}

export interface DocumentPermission {
  userId: string;
  permission: 'view' | 'edit' | 'sign' | 'manage';
  grantedAt: Date;
  grantedBy: string;
}

export interface DocumentVersion {
  version: number;
  documentId: string;
  changes: string;
  createdAt: Date;
  createdBy: string;
}

export interface DocumentFilters {
  type?: DocumentType[];
  status?: DocumentStatus[];
  customerId?: string;
  contractorId?: string;
  projectId?: string;
  uploadedBy?: string;
  requiresSignature?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  search?: string;
}

export interface CreateDocumentData {
  name: string;
  type: DocumentType;
  metadata: Omit<DocumentMetadata, 'version'>;
  file: File;
  customerId?: string;
  contractorId?: string;
  projectId?: string;
  requiresSignature?: boolean;
  visibility?: Document['visibility'];
  permissions?: Omit<DocumentPermission, 'grantedAt' | 'grantedBy'>[];
}