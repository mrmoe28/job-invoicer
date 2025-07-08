import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // For now, accept any login
    // In production, this would validate against the database
    if (email && password) {
      const mockSession = {
        user: {
          id: '1026dab7-7ffc-45a3-82c7-e6eb961756cd',
          email: email,
          firstName: 'Admin',
          lastName: 'User',
          role: 'owner',
          organizationId: '69dbb846-b799-42f8-91be-164ae3a589c4'
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      return NextResponse.json({ success: true, session: mockSession });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Handle GET requests to login endpoint
  return NextResponse.json({ message: 'Login endpoint - use POST method' }, { status: 405 });
}
