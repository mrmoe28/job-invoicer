import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Upload test endpoint called');
    
    return NextResponse.json({
      status: 'success',
      message: 'Upload test endpoint working',
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      }
    });

  } catch (error) {
    console.error('❌ Upload test failed:', error);
    
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Upload test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing file upload simulation...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided for test' },
        { status: 400 }
      );
    }

    console.log('📄 Test file details:', {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    return NextResponse.json({
      status: 'success',
      message: 'File upload test successful',
      fileDetails: {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      }
    });

  } catch (error) {
    console.error('❌ Upload test POST failed:', error);
    
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Upload test POST failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
