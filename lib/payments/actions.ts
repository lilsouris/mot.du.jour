'use server';

import { redirect } from 'next/navigation';
import { createCheckoutSession, createCustomerPortalSession } from './stripe';
import { createClient } from '@/lib/supabase/server';

export async function checkoutAction(formData: FormData) {
  const priceId = formData.get('priceId') as string;
  const supabase = await createClient();

  // Get current user for email
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/inscription?redirect=checkout&priceId=${priceId}`);
  }

  await createCheckoutSession({
    priceId,
    email: user.email,
  });
}

export async function customerPortalAction() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connection');
  }

  // Get user data from our database to check for stripe customer ID
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!userData?.stripe_customer_id) {
    redirect('/pricing');
  }

  const portalSession = await createCustomerPortalSession(
    userData.stripe_customer_id
  );
  redirect(portalSession.url);
}
