// Database health check API route following Neon best practices
// Reference: https://neon.com/docs/guides/nextjs

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getDatabaseInfo } from '@pulsecrm/db';

// GET /api/health/database - Check database connection and info
export async function GET(request: NextRequest) {
  try {
    // Get database info using our optimized connection
    const dbInfo = await getDatabaseInfo();
    
    // Additional Neon-specific health checks
    let neonStatus = null;
    if (process.env.DATABASE_URL?.includes('neon.tech')) {
      try {
        const sql = neon(process.env.DATABASE_URL);
        const result = await sql`
          SELECT 
            version() as version,
            current_database() as database,
            current_user() as user,
            pg_database_size(current_database()) as database_size,
            NOW() as server_time
        `;
        
        neonStatus = {
          connected: true,
          version: result[0]?.version,
          database: result[0]?.database,
          user: result[0]?.user,
          database_size: result[0]?.database_size,
          server_time: result[0]?.server_time,
          driver: 'neon-serverless'
        };
      } catch (error) {
        neonStatus = {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          driver: 'neon-serverless'
        };
      }
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbInfo,
      neon: neonStatus,
      environment: {
        node_env: process.env.NODE_ENV,
        vercel: process.env.VERCEL === '1',
        has_database_url: !!process.env.DATABASE_URL,
        is_neon: process.env.DATABASE_URL?.includes('neon.tech') || false,
      }
    });

  } catch (error) {
    console.error('Database health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        node_env: process.env.NODE_ENV,
        vercel: process.env.VERCEL === '1',
        has_database_url: !!process.env.DATABASE_URL,
        is_neon: process.env.DATABASE_URL?.includes('neon.tech') || false,
      }
    }, { status: 500 });
  }
}

// POST /api/health/database - Test database write operations
export async function POST(request: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    // Test write operation with a simple health check table
    await sql`
      CREATE TABLE IF NOT EXISTS health_checks (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT NOW(),
        status TEXT DEFAULT 'ok'
      )
    `;
    
    // Insert a health check record
    const result = await sql`
      INSERT INTO health_checks (status) 
      VALUES ('api_test') 
      RETURNING id, timestamp
    `;
    
    // Clean up old health check records (keep only last 10)
    await sql`
      DELETE FROM health_checks 
      WHERE id NOT IN (
        SELECT id FROM health_checks 
        ORDER BY timestamp DESC 
        LIMIT 10
      )
    `;
    
    return NextResponse.json({
      status: 'write_test_successful',
      timestamp: new Date().toISOString(),
      test_record: result[0],
      message: 'Database write operations working correctly'
    });

  } catch (error) {
    console.error('Database write test failed:', error);
    
    return NextResponse.json({
      status: 'write_test_failed',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
