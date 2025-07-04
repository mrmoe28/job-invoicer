import { NextRequest, NextResponse } from 'next/server';
import { sendInvoiceEmail } from '@/lib/email-service';
import { getAuthenticatedUser } from '@/lib/stack-auth-helpers';
import { db } from '@/lib/drizzle-db';
import { invoices, customers } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// POST /api/invoices/[id]/send-email - Send invoice email
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: invoiceId } = await params;
    const body = await req.json();
    
    const { 
      recipientEmail, 
      recipientName, 
      subject, 
      message,
      ccEmails = [],
      includeAttachment = true 
    } = body;

    // Validate required fields
    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'Recipient email is required' },
        { status: 400 }
      );
    }

    // Get invoice details
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Verify the invoice belongs to the authenticated user
    if (invoice.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to send this invoice' },
        { status: 403 }
      );
    }

    // Get customer details if available
    let customerDetails = null;
    if (invoice.customerId) {
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, invoice.customerId))
        .limit(1);
      customerDetails = customer;
    }

    // Prepare email data
    const emailData = {
      invoiceId: invoice.invoiceId,
      recipientEmail,
      recipientName: recipientName || customerDetails?.name || 'Customer',
      subject: subject || `Invoice ${invoice.invoiceId} from Your Company`,
      message: message || `Please find attached invoice ${invoice.invoiceId} for the amount of $${invoice.amount.toFixed(2)}.`,
      ccEmails,
      includeAttachment,
      invoiceData: {
        ...invoice,
        customerDetails
      }
    };

    // Send the email
    const result = await sendInvoiceEmail(emailData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    // Update invoice status if needed
    if (invoice.status === 'Draft') {
      await db
        .update(invoices)
        .set({
          status: 'Pending',
          updatedAt: new Date()
        })
        .where(eq(invoices.id, invoiceId));
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice email sent successfully',
      messageId: result.messageId
    });

  } catch (error) {
    console.error('Error sending invoice email:', error);
    return NextResponse.json(
      { error: 'Failed to send invoice email' },
      { status: 500 }
    );
  }
}
