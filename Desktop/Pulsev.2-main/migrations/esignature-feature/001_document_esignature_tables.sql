-- Migrate document system and e-signature features

-- Create document_status enum type
DO $$ BEGIN
    CREATE TYPE document_status AS ENUM (
        'draft',
        'pending_signature',
        'signed',
        'rejected',
        'expired'
    );
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END $$;

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(255) PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size TEXT NOT NULL,
    path TEXT NOT NULL,
    url TEXT,
    organization_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_documents_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_documents_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create document_signatures table
CREATE TABLE IF NOT EXISTS document_signatures (
    id VARCHAR(255) PRIMARY KEY,
    document_id VARCHAR(255) NOT NULL,
    signer_email VARCHAR(255) NOT NULL,
    signer_name VARCHAR(255) NOT NULL,
    status document_status NOT NULL DEFAULT 'pending_signature',
    signed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    signature_data JSONB,
    access_token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_document_signatures_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- Create signature_positions table
CREATE TABLE IF NOT EXISTS signature_positions (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(255) NOT NULL,
    signature_id VARCHAR(255),
    page INTEGER NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    width INTEGER NOT NULL DEFAULT 200,
    height INTEGER NOT NULL DEFAULT 50,
    required BOOLEAN NOT NULL DEFAULT TRUE,
    label TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_signature_positions_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_signature_positions_signature FOREIGN KEY (signature_id) REFERENCES document_signatures(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_organization_id ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_document_signatures_document_id ON document_signatures(document_id);
CREATE INDEX IF NOT EXISTS idx_document_signatures_signer_email ON document_signatures(signer_email);
CREATE INDEX IF NOT EXISTS idx_document_signatures_status ON document_signatures(status);
CREATE INDEX IF NOT EXISTS idx_signature_positions_document_id ON signature_positions(document_id);
CREATE INDEX IF NOT EXISTS idx_signature_positions_signature_id ON signature_positions(signature_id);
