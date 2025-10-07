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
    const { user_id, message_content } = body;

    // Convert user_id to string for UUID compatibility
    const userIdStr = user_id.toString();

    if (!user_id || !message_content) {
      return NextResponse.json(
        {
          error: 'Missing required fields: user_id, message_content',
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Create hash of the message content
    const messageHash = crypto
      .createHash('sha256')
      .update(message_content.trim())
      .digest('hex');

    // Check if this exact message was already sent to this user
    const { data: existingMessage, error } = await supabase
      .from('daily_message_logs')
      .select('id, sent_at')
      .eq('user_id', userIdStr)
      .eq('message_hash', messageHash)
      .eq('status', 'sent')
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error checking message history:', error);
      return NextResponse.json(
        { error: 'Failed to check message history' },
        { status: 500 }
      );
    }

    const messageExists = !!existingMessage;

    // Get all previous message hashes for this user (for additional context)
    const { data: userMessages, error: userMessagesError } = await supabase
      .from('daily_message_logs')
      .select('message_hash, sent_at')
      .eq('user_id', user_id)
      .eq('status', 'sent')
      .order('sent_at', { ascending: false })
      .limit(100); // Last 100 messages

    if (userMessagesError) {
      console.error('Error fetching user message history:', userMessagesError);
    }

    const previousMessageHashes =
      userMessages?.map(msg => msg.message_hash) || [];

    return NextResponse.json({
      success: true,
      message_exists: messageExists,
      message_hash: messageHash,
      user_id: userIdStr,
      previous_messages_count: previousMessageHashes.length,
      last_message_date: userMessages?.[0]?.sent_at || null,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
