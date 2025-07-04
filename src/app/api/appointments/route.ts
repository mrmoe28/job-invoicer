import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/stack-auth-helpers';
import { db } from '@/lib/drizzle-db';
import { appointments, customers } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// GET /api/appointments - Get all appointments
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userAppointments = await db
      .select()
      .from(appointments)
      .where(eq(appointments.userId, user.id))
      .orderBy(desc(appointments.date));

    return NextResponse.json({ appointments: userAppointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/appointments - Create a new appointment
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // If customerId is provided, fetch customer details
    let customerEmail = body.customerEmail;
    if (body.customerId) {
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, body.customerId))
        .limit(1);
      
      if (customer) {
        customerEmail = customer.email;
      }
    }

    const newAppointment = {
      id: nanoid(),
      ...body,
      customerEmail,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const [createdAppointment] = await db
      .insert(appointments)
      .values(newAppointment)
      .returning();

    return NextResponse.json({ 
      success: true, 
      appointment: createdAppointment 
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/appointments - Update an appointment
export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...updateData } = await req.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
    }

    // Prepare update data
    const dataToUpdate = {
      ...updateData,
      updatedAt: new Date()
    };

    const [updatedAppointment] = await db
      .update(appointments)
      .set(dataToUpdate)
      .where(eq(appointments.id, id))
      .returning();

    if (!updatedAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      appointment: updatedAppointment 
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/appointments - Delete an appointment
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
    }

    await db
      .delete(appointments)
      .where(eq(appointments.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
