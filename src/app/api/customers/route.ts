import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/stack-auth-helpers';
import { drizzleDb as db } from '@/lib/db';
import { customers } from '@/lib/schema';
import { nanoid } from 'nanoid';
import { eq, and } from 'drizzle-orm';

// GET /api/customers - Get all customers
export async function GET() {
  try {
    // Get authenticated user from Stack Auth
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch customers for the authenticated user
    const customersList = await db
      .select()
      .from(customers)
      .where(eq(customers.userId, user.id));

    return NextResponse.json(customersList);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/customers - Create a new customer
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Customer creation request received');
    
    // Get authenticated user from Stack Auth
    const user = await getAuthenticatedUser();
    console.log('🔍 Authenticated user:', user);

    if (!user) {
      console.log('❌ No authenticated user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('📋 Request body:', body);
    
    const {
      name,
      email,
      phone,
      company,
      address,
      contactPerson,
      customerType = 'residential',
      notifyByEmail = true,
      notifyBySmsText = true
    } = body;

    if (!name || !email) {
      console.log('❌ Validation failed: Missing name or email');
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Check if customer with this email already exists
    const existingCustomer = await db
      .select()
      .from(customers)
      .where(and(
        eq(customers.email, email),
        eq(customers.userId, user.id)
      ));

    if (existingCustomer.length > 0) {
      console.log('❌ Customer with email already exists:', email);
      return NextResponse.json({ 
        error: `A customer with email "${email}" already exists`, 
        existingCustomer: existingCustomer[0] 
      }, { status: 409 });
    }

    // Create new customer
    const newCustomer = {
      id: nanoid(),
      name,
      email,
      phone: phone || null,
      company: company || null,
      address: address || null,
      contactPerson: contactPerson || null,
      customerType,
      notifyByEmail,
      notifyBySmsText,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('💾 Creating customer with data:', newCustomer);

    const [customer] = await db
      .insert(customers)
      .values(newCustomer)
      .returning();

    console.log('✅ Customer created successfully:', customer);

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating customer:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json({ 
      error: 'Failed to create customer. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get authenticated user from Stack Auth
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      name,
      email,
      phone,
      company,
      address,
      contactPerson,
      customerType,
      notifyByEmail,
      notifyBySmsText
    } = body;

    if (!id || !name || !email) {
      return NextResponse.json({ error: 'ID, name and email are required' }, { status: 400 });
    }

    // Update customer (only if it belongs to the authenticated user)
    const [updatedCustomer] = await db
      .update(customers)
      .set({
        name,
        email,
        phone: phone || null,
        company: company || null,
        address: address || null,
        contactPerson: contactPerson || null,
        customerType: customerType || 'residential',
        notifyByEmail: notifyByEmail !== undefined ? notifyByEmail : true,
        notifyBySmsText: notifyBySmsText !== undefined ? notifyBySmsText : true,
        updatedAt: new Date()
      })
      .where(eq(customers.id, id))
      .returning();

    if (!updatedCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 