import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/stack-auth-helpers';
import { db } from '@/lib/drizzle-db';
import { leads } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// GET /api/leads - Get all leads
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.userId, user.id))
      .orderBy(desc(leads.createdAt));

    return NextResponse.json({ leads: userLeads });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/leads - Create a new lead
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    const newLead = {
      id: nanoid(),
      ...body,
      userId: user.id,
      createdDate: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: body.tags ? JSON.stringify(body.tags) : '[]',
      interests: body.interests ? JSON.stringify(body.interests) : '[]'
    };

    const [createdLead] = await db
      .insert(leads)
      .values(newLead)
      .returning();

    return NextResponse.json({ 
      success: true, 
      lead: {
        ...createdLead,
        tags: JSON.parse(createdLead.tags),
        interests: JSON.parse(createdLead.interests)
      }
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/leads - Update a lead
export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...updateData } = await req.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

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

// DELETE /api/leads - Delete a lead
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    await db
      .delete(leads)
      .where(eq(leads.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
