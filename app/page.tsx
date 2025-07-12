import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Logged in users go to dashboard
    redirect('/dashboard');
  } else {
    // Non-logged in users go to login
    redirect('/connection');
  }
}