import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

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

    // Try to get user data from the database first
    let userData = null;
    try {
      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (!dbError && dbUser) {
        console.log('✅ Found user in database');
        userData = dbUser;
      } else {
        console.log('⚠️ User not found in database, using auth data:', dbError?.message);
      }
    } catch (dbError) {
      console.log('⚠️ Database error, using auth data:', dbError);
    }

    // If no database user, attempt to bootstrap one now that we have an authenticated session
    if (!userData) {
      try {
        console.log('🧱 Bootstrapping missing user row in public.users');
        const bootstrapRow = {
          id: authUser.id,
          email: authUser.email,
          name: authUser.email?.split('@')[0] || null,
          role: 'owner'
        } as any;

        const { data: inserted, error: insertError } = await supabase
          .from('users')
          .insert(bootstrapRow)
          .select('*')
          .single();

        if (!insertError && inserted) {
          console.log('✅ Bootstrapped user in database');
          userData = inserted as any;
        } else {
          console.log('⚠️ Failed to bootstrap user, falling back to auth data:', insertError?.message);
        }
      } catch (insertCatchError) {
        console.log('⚠️ Unexpected error bootstrapping user:', insertCatchError);
      }

      // If still missing, return auth user data with defaults
      if (!userData) {
        userData = {
          id: authUser.id,
          email: authUser.email,
          name: authUser.email?.split('@')[0] || null,
          role: 'owner',
          stripe_customer_id: null,
          stripe_subscription_id: null,
          plan_name: null,
          subscription_status: null,
          phone_number: null,
          phone_country: null,
          created_at: authUser.created_at
        };
      }
    }

    console.log('✅ Returning user data');
    return NextResponse.json(userData);
  } catch (error) {
    console.error('💥 Unexpected error in /api/user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}