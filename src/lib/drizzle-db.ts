import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

// Database configuration with proper error handling
let db: ReturnType<typeof drizzle>;
let sql: any;

try {
  // Get database URL from environment
  const databaseUrl = process.env.DATABASE_URL;
  
  // Check if we have a valid database URL
  if (!databaseUrl || 
      databaseUrl === 'postgresql://user:pass@host.neon.tech/dbname?sslmode=require' ||
      databaseUrl === 'postgresql://username:password@ep-your-endpoint.region.aws.neon.tech/dbname?sslmode=require') {
    
    // In production, we need a real database URL
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL === '1') {
      console.error('DATABASE_URL is not properly configured for production!');
      console.error('Please set a valid Neon database URL in your Vercel environment variables.');
      
      // Create a dummy database that will fail at runtime but allow build to complete
      sql = () => {
        throw new Error('Database not configured. Please set DATABASE_URL in Vercel environment variables.');
      };
      db = {} as any; // This will fail at runtime if accessed
    } else {
      // Development mode - show helpful message
      console.warn('⚠️  DATABASE_URL not configured properly.');
      console.warn('   Using mock database for development.');
      console.warn('   To use a real database:');
      console.warn('   1. Go to https://neon.tech');
      console.warn('   2. Create a free database');
      console.warn('   3. Set DATABASE_URL in .env');
      
      // Create mock implementations
      sql = () => ({});
      db = {
        select: () => ({ 
          from: () => ({ 
            where: () => ({ 
              limit: () => Promise.resolve([]),
              orderBy: () => Promise.resolve([])
            }) 
          }) 
        }),
        insert: () => ({ 
          values: () => ({ 
            returning: () => Promise.resolve([{ id: 'mock-id' }]) 
          }) 
        }),
        update: () => ({ 
          set: () => ({ 
            where: () => ({ 
              returning: () => Promise.resolve([]) 
            }) 
          }) 
        }),
        delete: () => ({ 
          where: () => Promise.resolve() 
        })
      } as any;
    }
  } else {
    // Valid database URL - initialize Neon
    sql = neon(databaseUrl);
    db = drizzle(sql);
  }
} catch (error) {
  console.error('Failed to initialize database:', error);
  
  // Allow build to continue but will fail at runtime
  sql = () => {
    throw new Error('Database initialization failed');
  };
  db = {} as any;
}

export { db, sql };