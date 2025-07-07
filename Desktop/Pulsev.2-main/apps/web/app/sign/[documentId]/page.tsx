import { db } from '@/lib/db';
import { documents, documentSignatures } from '@/lib/db-schema';
import { eq, and } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';

interface PageProps {
  params: {
    documentId: string;
  };
  searchParams: {
    token?: string;
  };
}

// This is a Server Component that validates the token and document before rendering the client component
export default async function SignDocumentPage({ params, searchParams }: PageProps) {
  const { documentId } = params;
  const { token } = searchParams;

  // Redirect to error page if no token is provided
  if (!token) {
    redirect('/sign/error?reason=missing_token');
  }

  try {
    // Find the document
    const documentResult = await db.select().from(documents).where(eq(documents.id, documentId)).limit(1);
    
    if (documentResult.length === 0) {
      notFound();
    }

    const document = documentResult[0];

    // Find the signature request associated with this token
    const signatureResult = await db.select().from(documentSignatures)
      .where(
        and(
          eq(documentSignatures.documentId, documentId),
          eq(documentSignatures.accessToken, token)
        )
      )
      .limit(1);

    if (signatureResult.length === 0) {
      redirect('/sign/error?reason=invalid_token');
    }

    const signature = signatureResult[0];

    // Check if the signature has already been completed
    if (signature.status === 'signed') {
      redirect(`/sign/complete?documentId=${documentId}`);
    }

    // Check if the signature request has expired
    if (signature.expiresAt && new Date(signature.expiresAt) < new Date()) {
      redirect('/sign/error?reason=expired_token');
    }

    // If everything is valid, render the sign page
    return (
      <SignDocumentView 
        document={document}
        signature={signature}
      />
    );
  } catch (error) {
    console.error('Error in sign document page:', error);
    redirect('/sign/error?reason=server_error');
  }
}

// Import the client component for signing
import SignDocumentView from '@/components/sign-document-view';
