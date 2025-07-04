import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/stack-auth-helpers';
import { db } from '@/lib/drizzle-db';
import { leads } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// GET /api/leads/[id] - Get a specific lead
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

    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, id))
      .limit(1);

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Parse JSON fields
    const formattedLead = {
      ...lead,
      tags: JSON.parse(lead.tags),
      interests: JSON.parse(lead.interests)
    };

    return NextResponse.json({ lead: formattedLead });
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/leads/[id] - Update a specific lead
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

    // Prepare update data
    const dataToUpdate = {
      ...updateData,
      updatedAt: new Date(),
      tags: updateData.tags ? JSON.stringify(updateData.tags) : undefined,
      interests: updateData.interests ? JSON.stringify(updateData.interests) : undefined
    };

    // Remove undefined values
    Object.keys(dataToUpdate).forEach(key =>
      dataToUpdate[key] === undefined && delete dataToUpdate[key]
    );

    const [updatedLead] = await db
      .update(leads)
      .set(dataToUpdate)
      .where(eq(leads.id, id))
      .returning();

    if (!updatedLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      lead: {
        ...updatedLead,
        tags: JSON.parse(updatedLead.tags),
        interests: JSON.parse(updatedLead.interests)
      }
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/leads/[id] - Partially update a lead
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

    // For status updates
    if (body.status !== undefined || body.score !== undefined || body.estimatedValue !== undefined || body.probability !== undefined) {
      const updateData: {
        updatedAt: Date;
        status?: string;
        score?: number;
        estimatedValue?: number;
        probability?: number;
        notes?: string;
        nextFollowUp?: string;
      } = {
        updatedAt: new Date()
      };

      if (body.status !== undefined) updateData.status = body.status;
      if (body.score !== undefined) updateData.score = body.score;
      if (body.estimatedValue !== undefined) updateData.estimatedValue = body.estimatedValue;
      if (body.probability !== undefined) updateData.probability = body.probability;
      if (body.notes !== undefined) updateData.notes = body.notes;
      if (body.nextFollowUp !== undefined) updateData.nextFollowUp = body.nextFollowUp;

      const [updatedLead] = await db
        .update(leads)
        .set(updateData)
        .where(eq(leads.id, id))
        .returning();

      if (!updatedLead) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        lead: {
          ...updatedLead,
          tags: JSON.parse(updatedLead.tags),
          interests: JSON.parse(updatedLead.interests)
        }
      });
    }

    // For converting to customer
    if (body.convertToCustomer) {
      const [lead] = await db
        .select()
        .from(leads)
        .where(eq(leads.id, id))
        .limit(1);

      if (!lead) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }

      // Update lead status to converted
      await db
        .update(leads)
        .set({
          status: 'Converted',
          updatedAt: new Date()
        })
        .where(eq(leads.id, id));

      return NextResponse.json({
        success: true,
        message: 'Lead converted to customer',
        customerData: {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          address: lead.location
        }
      });
    }

    return NextResponse.json({ error: 'Invalid update operation' }, { status: 400 });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/leads/[id] - Delete a specific lead
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

    await db
      .delete(leads)
      .where(eq(leads.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
