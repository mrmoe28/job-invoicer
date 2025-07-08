import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export class ApiError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

// Common HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Success response helper
export function successResponse<T>(
  data: T,
  status: number = HTTP_STATUS.OK,
  meta?: ApiResponse['meta']
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta && { meta }),
    },
    { status }
  );
}

// Error response helper
export function errorResponse(
  message: string,
  status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  code?: string,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        ...(code && { code }),
        ...(details && { details }),
      },
    },
    { status }
  );
}

// Validation helper
export async function validateRequest<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ApiError(
        'Validation failed',
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        'VALIDATION_ERROR',
        error.errors
      );
    }
    throw new ApiError(
      'Invalid request body',
      HTTP_STATUS.BAD_REQUEST,
      'INVALID_BODY'
    );
  }
}

// Authentication helper
export async function getAuthenticatedUser(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new ApiError(
      'Authentication required',
      HTTP_STATUS.UNAUTHORIZED,
      'MISSING_TOKEN'
    );
  }

  const token = authorization.substring(7);
  
  // Validate token and get user
  // This is a simplified example - implement proper JWT validation
  try {
    // const user = await validateJWT(token);
    // return user;
    
    // For now, return a mock user - replace with actual JWT validation
    return {
      id: 'user-123',
      email: 'user@example.com',
      organizationId: 'org-123',
    };
  } catch (error) {
    throw new ApiError(
      'Invalid or expired token',
      HTTP_STATUS.UNAUTHORIZED,
      'INVALID_TOKEN'
    );
  }
}

// API handler wrapper with error handling
export function withErrorHandling(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('API Error:', error);

      if (error instanceof ApiError) {
        return errorResponse(
          error.message,
          error.statusCode,
          error.code,
          error.details
        );
      }

      if (error instanceof ZodError) {
        return errorResponse(
          'Validation failed',
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          'VALIDATION_ERROR',
          error.errors
        );
      }

      // Generic server error
      return errorResponse(
        process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : error instanceof Error 
            ? error.message 
            : 'Unknown error',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'INTERNAL_ERROR'
      );
    }
  };
}

// Rate limiting helper
export function withRateLimit(
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (request: NextRequest) => {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [key, value] of requests.entries()) {
      if (value.resetTime < windowStart) {
        requests.delete(key);
      }
    }

    const current = requests.get(ip) || { count: 0, resetTime: now + windowMs };

    if (current.count >= limit) {
      throw new ApiError(
        'Too many requests',
        HTTP_STATUS.TOO_MANY_REQUESTS,
        'RATE_LIMIT_EXCEEDED',
        {
          limit,
          windowMs,
          resetTime: current.resetTime,
        }
      );
    }

    current.count++;
    requests.set(ip, current);
  };
}

// CORS helper
export function withCors(request: NextRequest, response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }

  return response;
}