import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from '../db-schema';
import { Logger } from 'drizzle-orm/logger';

// Custom logger for database queries
class DatabaseLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Database Query:', query);
      if (params.length > 0) {
        console.log('📊 Parameters:', params);
      }
    }
  }
}

// Initialize database connection with optimizations
export const db = drizzle(sql, {
  schema,
  logger: process.env.NODE_ENV === 'development' ? new DatabaseLogger() : false,
});

// Database connection health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Transaction wrapper with error handling
export async function withTransaction<T>(
  operation: (tx: typeof db) => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await db.transaction(async (tx) => {
        return await operation(tx);
      });
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain errors
      if (
        error instanceof Error &&
        (error.message.includes('constraint') ||
         error.message.includes('duplicate') ||
         error.message.includes('foreign key'))
      ) {
        throw error;
      }

      if (attempt < maxRetries) {
        console.warn(`Transaction attempt ${attempt} failed, retrying...`, error);
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw lastError!;
}

// Generic repository interface
export interface Repository<T, CreateT = Partial<T>, UpdateT = Partial<T>> {
  findById(id: string): Promise<T | null>;
  findMany(filters?: any): Promise<T[]>;
  create(data: CreateT): Promise<T>;
  update(id: string, data: UpdateT): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

// Pagination helper
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export function getPaginationParams(options: PaginationOptions = {}) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 10));
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
    sortBy: options.sortBy || 'createdAt',
    sortOrder: options.sortOrder || 'desc',
  };
}

export function createPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

// Database error handling
export class DatabaseError extends Error {
  public code?: string;
  public constraint?: string;

  constructor(message: string, code?: string, constraint?: string) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.constraint = constraint;
  }
}

export function handleDatabaseError(error: any): never {
  if (error.code) {
    switch (error.code) {
      case '23505': // unique_violation
        throw new DatabaseError(
          'A record with this information already exists',
          'DUPLICATE_ENTRY',
          error.constraint
        );
      case '23503': // foreign_key_violation
        throw new DatabaseError(
          'Referenced record does not exist',
          'FOREIGN_KEY_VIOLATION',
          error.constraint
        );
      case '23502': // not_null_violation
        throw new DatabaseError(
          'Required field is missing',
          'MISSING_REQUIRED_FIELD',
          error.column
        );
      case '42P01': // undefined_table
        throw new DatabaseError(
          'Database table not found',
          'TABLE_NOT_FOUND'
        );
      default:
        console.error('Database error:', error);
        throw new DatabaseError(
          'Database operation failed',
          'DATABASE_ERROR'
        );
    }
  }

  throw new DatabaseError(
    error.message || 'Unknown database error',
    'UNKNOWN_ERROR'
  );
}

// Connection pool monitoring
export async function getDatabaseStats() {
  try {
    const result = await sql`
      SELECT 
        datname as database_name,
        numbackends as active_connections,
        xact_commit as committed_transactions,
        xact_rollback as rolled_back_transactions,
        blks_read as blocks_read,
        blks_hit as blocks_hit,
        tup_returned as tuples_returned,
        tup_fetched as tuples_fetched,
        tup_inserted as tuples_inserted,
        tup_updated as tuples_updated,
        tup_deleted as tuples_deleted
      FROM pg_stat_database 
      WHERE datname = current_database()
    `;

    return result.rows[0] || null;
  } catch (error) {
    console.error('Failed to get database stats:', error);
    return null;
  }
}