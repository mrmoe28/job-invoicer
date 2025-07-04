import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/stack-auth-helpers';
import { db } from '@/lib/drizzle-db';
import { payments, invoices, customers } from '@/lib/schema';
import { eq, desc, and, or, like } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// GET /api/payments - Get all payments
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build where conditions
    const conditions = [eq(payments.userId, user.id)];
    
    if (status) {
      conditions.push(eq(payments.status, status));
    }
    
    if (search) {
      conditions.push(
        or(
          like(payments.customerName, `%${search}%`),
          like(payments.invoiceNumber, `%${search}%`)
        )
      );
    }

    const userPayments = await db
      .select()
      .from(payments)
      .where(and(...conditions))
      .orderBy(desc(payments.createdAt));

    return NextResponse.json({ payments: userPayments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/payments - Create a new payment
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // If invoiceId is provided, update the invoice status
    if (body.invoiceId) {
      const [invoice] = await db
        .select()
        .from(invoices)
        .where(eq(invoices.id, body.invoiceId))
        .limit(1);
      
      if (invoice) {
        // Update invoice status to Paid
        await db
          .update(invoices)
          .set({
            status: 'Paid',
            updatedAt: new Date()
          })
          .where(eq(invoices.id, body.invoiceId));
        
        // Set invoice number and customer name from invoice
        body.invoiceNumber = invoice.invoiceId;
        body.customerName = invoice.customerName;
      }
    }

    const newPayment = {
      id: nanoid(),
      ...body,
      status: body.status || 'Paid',
      paymentDate: body.paymentDate || new Date(),
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const [createdPayment] = await db
      .insert(payments)
      .values(newPayment)
      .returning();

    return NextResponse.json({ 
      success: true, 
      payment: createdPayment 
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
