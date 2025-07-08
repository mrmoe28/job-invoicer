import { NextRequest, NextResponse } from 'next/server';
import { db } from '@pulsecrm/db';
import { organizations, users } from '@pulsecrm/db';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic database connection
    const orgs = await db.select().from(organizations).limit(1);
    const usersList = await db.select().from(users).limit(1);
    
    console.log('✅ Database test successful');
    console.log('📊 Organizations found:', orgs.length);
    console.log('👥 Users found:', usersList.length);
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection working',
      data: {
        organizations: orgs.length,
        users: usersList.length,
        sampleOrg: orgs[0] ? { id: orgs[0].id, name: orgs[0].name } : null,
        sampleUser: usersList[0] ? { id: usersList[0].id, email: usersList[0].email } : null
      }
    });

  } catch (error) {
    console.error('❌ Database test failed:', error);
    
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
