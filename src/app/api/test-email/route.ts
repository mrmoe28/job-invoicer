import { NextRequest, NextResponse } from 'next/server';
import { sendInvoiceEmail, testEmailConfig } from '@/lib/email-service';

export async function POST(req: NextRequest) {
  try {
    const { testEmail } = await req.json();

    if (!testEmail) {
      return NextResponse.json(
        { error: 'Test email address is required' },
        { status: 400 }
      );
    }

    // First test the email configuration
    const configTest = await testEmailConfig();
    if (!configTest.success) {
      return NextResponse.json(
        {
          error: 'Email configuration failed',
          details: configTest.error
        },
        { status: 500 }
      );
    }

    // Send a test invoice email
    const testInvoiceData = {
      invoiceId: 'TEST-001',
      customerName: 'Test Customer',
      customerEmail: testEmail,
      amount: 100.00,
      companyName: 'EKO SOLAR'
    };

    const result = await sendInvoiceEmail(testInvoiceData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully!',
        messageId: result.messageId
      });
    } else {
      return NextResponse.json(
        {
          error: 'Failed to send test email',
          details: result.error
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const configTest = await testEmailConfig();

    return NextResponse.json({
      configured: configTest.success,
      error: configTest.error || null
    });
  } catch (error) {
    console.error('Email configuration test error:', error);
    return NextResponse.json(
      { error: 'Failed to test email configuration' },
      { status: 500 }
    );
  }
} 