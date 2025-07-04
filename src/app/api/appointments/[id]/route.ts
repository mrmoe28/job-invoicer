import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/stack-auth-helpers';
import { db } from '@/lib/drizzle-db';
import { appointments, customers } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// GET /api/appointments/[id] - Get a specific appointment
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id))
      .limit(1);

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Verify the appointment belongs to the user
    if (appointment.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/appointments/[id] - Update a specific appointment
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const updateData = await req.json();

    // If customerId is provided, fetch customer details
    if (updateData.customerId) {
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, updateData.customerId))
        .limit(1);
      
      if (customer) {
        updateData.customerEmail = customer.email;
      }
    }

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

// PATCH /api/appointments/[id] - Partially update an appointment
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    
    // For status updates only
    if (body.status) {
      const [updatedAppointment] = await db
        .update(appointments)
        .set({
          status: body.status,
          updatedAt: new Date()
        })
        .where(eq(appointments.id, id))
        .returning();

      if (!updatedAppointment) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        appointment: updatedAppointment 
      });
    }

    // For photo uploads
    if (body.photoUrl !== undefined) {
      const [updatedAppointment] = await db
        .update(appointments)
        .set({
          photoUrl: body.photoUrl,
          updatedAt: new Date()
        })
        .where(eq(appointments.id, id))
        .returning();

      if (!updatedAppointment) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        appointment: updatedAppointment 
      });
    }

    return NextResponse.json({ error: 'Invalid update operation' }, { status: 400 });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/appointments/[id] - Delete a specific appointment
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify the appointment exists and belongs to the user
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id))
      .limit(1);

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (appointment.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
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
