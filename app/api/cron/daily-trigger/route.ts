import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request from Vercel
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Trigger the Make.com webhook
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;

    if (!makeWebhookUrl) {
      return NextResponse.json(
        { error: 'Make webhook URL not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(makeWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trigger_type: 'daily_scheduled',
        timestamp: new Date().toISOString(),
        source: 'vercel_cron',
      }),
    });

    if (!response.ok) {
      console.error('Failed to trigger Make.com webhook:', response.status);
      return NextResponse.json(
        {
          error: 'Failed to trigger webhook',
          status: response.status,
        },
        { status: 500 }
      );
    }

    console.log(
      'Successfully triggered Make.com webhook at',
      new Date().toISOString()
    );

    return NextResponse.json({
      success: true,
      message: 'Daily webhook triggered successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Only allow GET requests from Vercel cron
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
