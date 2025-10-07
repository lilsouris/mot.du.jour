import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getRecentActivities, getCurrentUserId } from '@/lib/activity/logger';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get recent activities (max 5, last 3 days)
    const activities = await getRecentActivities(user.id, 5, 3);

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
