import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/stack-auth-helpers';
import { db } from '@/lib/drizzle-db';
import { invoices, customers } from '@/lib/schema';
import { eq, desc, and, or, like, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// GET /api/invoices - Get all invoices with filtering
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
    const conditions = [eq(invoices.userId, user.id)];

    if (status && status !== 'All') {
      conditions.push(eq(invoices.status, status));
    }

    if (search) {
      conditions.push(
        or(
          like(invoices.customerName, `%${search}%`),
          like(invoices.invoiceId, `%${search}%`)
        )!
      );
    }

    const userInvoices = await db
      .select()
      .from(invoices)
      .where(and(...conditions))
      .orderBy(desc(invoices.createdAt));

    return NextResponse.json({ invoices: userInvoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/invoices - Create a new invoice
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Generate invoice ID
    const invoiceCount = await db
      .select({ count: sql`count(*)` })
      .from(invoices)
      .where(eq(invoices.userId, user.id));

    const count = Number(invoiceCount[0]?.count || 0);
    const invoiceId = `INV-${String(count + 1).padStart(4, '0')}`;

    // If customerId is provided, get customer details
    let customerName = body.customerName;
    if (body.customerId) {
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, body.customerId))
        .limit(1);

      if (customer) {
        customerName = customer.name;
      }
    }

    const newInvoice = {
      id: nanoid(),
      invoiceId,
      customerName,
      amount: body.amount || 0,
      description: body.description || null,
      status: body.status || 'Pending',
      userId: user.id,
      customerId: body.customerId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const [createdInvoice] = await db
      .insert(invoices)
      .values(newInvoice)
      .returning();

    return NextResponse.json({
      success: true,
      invoice: createdInvoice
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/invoices - Update an invoice
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    // If customerId is provided, get customer details
    if (updateData.customerId) {
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, updateData.customerId))
        .limit(1);

      if (customer) {
        updateData.customerName = customer.name;
      }
    }

    const dataToUpdate = {
      ...updateData,
      updatedAt: new Date()
    };

    const [updatedInvoice] = await db
      .update(invoices)
      .set(dataToUpdate)
      .where(eq(invoices.id, id))
      .returning();

    if (!updatedInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/invoices - Delete an invoice
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    await db
      .delete(invoices)
      .where(eq(invoices.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
