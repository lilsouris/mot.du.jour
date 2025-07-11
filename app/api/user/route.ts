import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user from Supabase
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    console.log('🔍 API /user - Auth user check:', { authUser: !!authUser, authError });
    
    if (authError || !authUser) {
      console.log('❌ No authenticated user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Auth user found:', authUser.id, authUser.email);

    // For now, just return the auth user data with some defaults
    // We can enhance this later when the database schema is fixed
    const userData = {
      id: authUser.id,
      email: authUser.email,
      name: authUser.email?.split('@')[0] || null,
      role: 'owner',
      stripe_customer_id: null,
      stripe_subscription_id: null,
      plan_name: null,
      subscription_status: null,
      created_at: authUser.created_at
    };

    console.log('✅ Returning user data');
    return NextResponse.json(userData);
  } catch (error) {
    console.error('💥 Unexpected error in /api/user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}