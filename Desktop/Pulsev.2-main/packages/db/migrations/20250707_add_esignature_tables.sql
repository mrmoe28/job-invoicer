-- Migration: Add Document Signatures and Templates
-- Created: 2025-07-07
-- Purpose: Add e-signature functionality to Pulse CRM

-- Document Signatures table
CREATE TABLE IF NOT EXISTS document_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    document_id UUID NOT NULL REFERENCES documents(id),
    signer_id UUID REFERENCES users(id),
    signer_name VARCHAR(255) NOT NULL,
    signer_email VARCHAR(255) NOT NULL,
    signer_role VARCHAR(100),
    signature_data TEXT,
    signature_type VARCHAR(50) NOT NULL DEFAULT 'draw',
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    signed_at TIMESTAMP,
    expired_at TIMESTAMP,
    declined_at TIMESTAMP,
    decline_reason TEXT,
    verification_code VARCHAR(10),
    is_email_sent BOOLEAN NOT NULL DEFAULT false,
    email_sent_at TIMESTAMP,
    reminders_sent INTEGER NOT NULL DEFAULT 0,
    last_reminder_at TIMESTAMP,
    signature_position JSONB,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Document Templates table
CREATE TABLE IF NOT EXISTS document_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    template_type VARCHAR(50) NOT NULL DEFAULT 'pdf',
    template_data TEXT,
    file_path VARCHAR(500),
    signature_fields JSONB,
    variables JSONB,
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by_user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for document_signatures
CREATE INDEX IF NOT EXISTS document_signatures_document_idx ON document_signatures(document_id);
CREATE INDEX IF NOT EXISTS document_signatures_signer_idx ON document_signatures(signer_id);
CREATE INDEX IF NOT EXISTS document_signatures_email_idx ON document_signatures(signer_email);
CREATE INDEX IF NOT EXISTS document_signatures_status_idx ON document_signatures(status);
CREATE INDEX IF NOT EXISTS document_signatures_org_idx ON document_signatures(organization_id);

-- Create indexes for document_templates
CREATE INDEX IF NOT EXISTS document_templates_name_idx ON document_templates(name);
CREATE INDEX IF NOT EXISTS document_templates_category_idx ON document_templates(category);
CREATE INDEX IF NOT EXISTS document_templates_type_idx ON document_templates(template_type);
CREATE INDEX IF NOT EXISTS document_templates_org_idx ON document_templates(organization_id);

-- Update documents table to ensure it exists with required fields for e-signatures
ALTER TABLE documents ADD COLUMN IF NOT EXISTS requires_signature BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS signature_deadline TIMESTAMP;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS signature_instructions TEXT;

-- Insert default document templates for solar contracts
INSERT INTO document_templates (organization_id, name, description, category, template_type, signature_fields, variables, is_default, created_by_user_id)
SELECT 
    o.id,
    'Solar Installation Contract',
    'Standard solar panel installation agreement template',
    'contract',
    'pdf',
    '[{"type": "signature", "required": true, "label": "Customer Signature", "role": "customer"}, {"type": "signature", "required": true, "label": "Contractor Signature", "role": "contractor"}]'::jsonb,
    '["customerName", "customerAddress", "projectAddress", "systemSize", "totalCost", "installationDate"]'::jsonb,
    true,
    u.id
FROM organizations o
CROSS JOIN LATERAL (
    SELECT id FROM users WHERE organization_id = o.id AND role = 'owner' LIMIT 1
) u
WHERE NOT EXISTS (
    SELECT 1 FROM document_templates dt 
    WHERE dt.organization_id = o.id AND dt.name = 'Solar Installation Contract'
);

-- Insert sample solar proposal template
INSERT INTO document_templates (organization_id, name, description, category, template_type, signature_fields, variables, is_default, created_by_user_id)
SELECT 
    o.id,
    'Solar Proposal Agreement',
    'Solar system proposal and cost estimate template',
    'proposal',
    'pdf',
    '[{"type": "signature", "required": true, "label": "Customer Acceptance", "role": "customer"}]'::jsonb,
    '["customerName", "systemSize", "estimatedSavings", "totalCost", "proposalDate", "validUntil"]'::jsonb,
    true,
    u.id
FROM organizations o
CROSS JOIN LATERAL (
    SELECT id FROM users WHERE organization_id = o.id AND role = 'owner' LIMIT 1
) u
WHERE NOT EXISTS (
    SELECT 1 FROM document_templates dt 
    WHERE dt.organization_id = o.id AND dt.name = 'Solar Proposal Agreement'
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_document_signatures_updated_at ON document_signatures;
CREATE TRIGGER update_document_signatures_updated_at
    BEFORE UPDATE ON document_signatures
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_document_templates_updated_at ON document_templates;
CREATE TRIGGER update_document_templates_updated_at
    BEFORE UPDATE ON document_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
