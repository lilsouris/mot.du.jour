import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.WEBHOOK_SECRET;
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      user_id, 
      phone_number, 
      message_content, 
      status = 'sent',
      twilio_sid = null,
      error_message = null
    } = body;
    
    // Convert user_id to string for UUID compatibility  
    const userIdStr = user_id.toString();

    if (!user_id || !phone_number || !message_content) {
      return NextResponse.json({ 
        error: 'Missing required fields: user_id, phone_number, message_content' 
      }, { status: 400 });
    }

    const supabase = await createClient();

    // Create hash of the message content
    const messageHash = crypto.createHash('sha256').update(message_content.trim()).digest('hex');

    // Insert the message log
    const { data, error } = await supabase
      .from('daily_message_logs')
      .insert({
        user_id: userIdStr,
        phone_number,
        message_content: message_content.trim(),
        message_hash: messageHash,
        status,
        twilio_sid,
        error_message,
        sent_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging message:', error);
      return NextResponse.json({ error: 'Failed to log message' }, { status: 500 });
    }

    console.log(`Message logged for user ${userIdStr}: ${status}`);

    return NextResponse.json({
      success: true,
      log_id: data.id,
      message_hash: messageHash,
      status,
      sent_at: data.sent_at
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}