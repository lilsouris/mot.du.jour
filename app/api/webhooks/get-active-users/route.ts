import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.WEBHOOK_SECRET;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get all users with phone numbers (for testing, we'll include all users)
    const { data: users, error } = await supabase
      .from('users')
      .select(
        `
        id,
        email,
        phone_number,
        phone_country,
        role
      `
      )
      .not('phone_number', 'is', null)
      .not('phone_country', 'is', null);

    if (error) {
      console.error('Error fetching active users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Transform data for Make.com
    const activeUsers =
      users?.map(user => {
        // Format phone number: remove leading 0 and add country code with +
        let formattedPhone = user.phone_number?.toString() || '';
        if (formattedPhone.startsWith('0')) {
          formattedPhone = formattedPhone.substring(1); // Remove leading 0
        }
        const fullPhoneNumber = `${user.phone_country}${formattedPhone}`;

        return {
          user_id: user.id.toString(),
          email: user.email,
          phone_number: fullPhoneNumber,
          role: user.role,
          plan_name: 'Test Plan',
          subscription_status: 'active',
        };
      }) || [];

    console.log(`Found ${activeUsers.length} active users with phone numbers`);

    return NextResponse.json({
      success: true,
      count: activeUsers.length,
      users: activeUsers,
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
