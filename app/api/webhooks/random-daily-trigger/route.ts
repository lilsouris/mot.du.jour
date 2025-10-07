import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.WEBHOOK_SECRET;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate random time between 8 AM and 10 PM (in minutes from 8 AM)
    const minMinutes = 0; // 8 AM
    const maxMinutes = 14 * 60; // 10 PM (14 hours * 60 minutes)
    const randomMinutes =
      Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) + minMinutes;

    // Convert to hours and minutes for readability
    const hours = Math.floor(randomMinutes / 60) + 8; // Add 8 for 8 AM base
    const minutes = randomMinutes % 60;

    // Calculate delay in milliseconds from now until the random time
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      0
    );

    // If the random time has already passed today, schedule for tomorrow
    if (today <= now) {
      today.setDate(today.getDate() + 1);
    }

    const delayMs = today.getTime() - now.getTime();

    // Trigger Make.com webhook after the calculated delay
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;

    if (!makeWebhookUrl) {
      return NextResponse.json(
        { error: 'Make webhook URL not configured' },
        { status: 500 }
      );
    }

    // Schedule the trigger using setTimeout (for demonstration)
    // In production, you'd want to use a proper job queue
    setTimeout(async () => {
      try {
        await fetch(makeWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            trigger_time: today.toISOString(),
            trigger_type: 'random_daily',
          }),
        });
        console.log(
          `Random daily message trigger executed at ${today.toISOString()}`
        );
      } catch (error) {
        console.error('Failed to trigger Make webhook:', error);
      }
    }, delayMs);

    return NextResponse.json({
      success: true,
      scheduled_time: today.toISOString(),
      delay_ms: delayMs,
      delay_hours: Math.round((delayMs / (1000 * 60 * 60)) * 100) / 100,
    });
  } catch (error) {
    console.error('Random trigger webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
