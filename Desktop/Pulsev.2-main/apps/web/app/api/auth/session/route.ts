import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // For now, return a mock session
    // In production, this would validate actual session tokens
    const mockSession = {
      user: {
        id: '1026dab7-7ffc-45a3-82c7-e6eb961756cd',
        email: 'admin@pulsecrm.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'owner',
        organizationId: '69dbb846-b799-42f8-91be-164ae3a589c4'
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    return NextResponse.json(mockSession);
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ error: 'Session not found' }, { status: 401 });
  }
}
