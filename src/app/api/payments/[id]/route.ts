import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/stack-auth-helpers';
import { db } from '@/lib/drizzle-db';
import { payments, invoices } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// GET /api/payments/[id] - Get a specific payment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id))
      .limit(1);

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Verify the payment belongs to the user
    if (payment.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/payments/[id] - Update a payment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const updateData = await request.json();

    const dataToUpdate = {
      ...updateData,
      updatedAt: new Date()
    };

    const [updatedPayment] = await db
      .update(payments)
      .set(dataToUpdate)
      .where(eq(payments.id, id))
      .returning();

    if (!updatedPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update invoice status if payment status changed to Paid
    if (updateData.status === 'Paid' && updatedPayment.invoiceId) {
      await db
        .update(invoices)
        .set({
          status: 'Paid',
          updatedAt: new Date()
        })
        .where(eq(invoices.id, updatedPayment.invoiceId));
    }

    return NextResponse.json({ 
      success: true, 
      payment: updatedPayment 
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/payments/[id] - Delete a payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify the payment exists and belongs to the user
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id))
      .limit(1);

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // If payment is linked to an invoice, update invoice status
    if (payment.invoiceId && payment.status === 'Paid') {
      await db
        .update(invoices)
        .set({
          status: 'Pending',
          updatedAt: new Date()
        })
        .where(eq(invoices.id, payment.invoiceId));
    }

    await db
      .delete(payments)
      .where(eq(payments.id, id));

    return NextResponse.json({ 
      success: true,
      message: 'Payment deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/payments/[id] - Record payment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { action, ...data } = await request.json();

    if (action === 'record-payment') {
      const [updatedPayment] = await db
        .update(payments)
        .set({
          status: 'Paid',
          paymentDate: new Date(),
          ...data,
          updatedAt: new Date()
        })
        .where(eq(payments.id, id))
        .returning();

      if (!updatedPayment) {
        return NextResponse.json(
          { error: 'Payment not found' },
          { status: 404 }
        );
      }

      // Update associated invoice
      if (updatedPayment.invoiceId) {
        await db
          .update(invoices)
          .set({
            status: 'Paid',
            updatedAt: new Date()
          })
          .where(eq(invoices.id, updatedPayment.invoiceId));
      }

      return NextResponse.json({ 
        success: true, 
        payment: updatedPayment 
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
