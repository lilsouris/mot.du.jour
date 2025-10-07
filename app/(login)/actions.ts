'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { validatedAction } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { logActivity } from '@/lib/activity/logger';

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;
  const supabase = await createClient();

  console.log('🔐 Starting sign in process');
  console.log('📧 Attempting to sign in with email:', email);

  console.log('🔐 Attempting Supabase auth with email:', email);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error('❌ Supabase auth error:', authError.message);
    return {
      error: 'Email ou mot de passe invalide. Veuillez réessayer.',
      email,
      password
    };
  }

  if (!authData.user) {
    console.error('❌ No user returned from Supabase');
    return {
      error: 'Email ou mot de passe invalide. Veuillez réessayer.',
      email,
      password
    };
  }

  console.log('✅ Authentication successful!');
  
  // Log the login activity
  await logActivity(authData.user.id, 'login');
  
  console.log('🏠 Redirecting to dashboard');
  
  // Don't catch redirect errors - they need to bubble up
  redirect('/dashboard');
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  phoneNumber: z.string().optional(),
  phoneCountry: z.string().optional(),
  plan: z.string().optional()
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, phoneNumber, phoneCountry, plan } = data;
  const supabase = await createClient();

  console.log('🆕 Starting sign up process');
  console.log('📧 Attempting to sign up with email:', email);
  console.log('📝 Form data snapshot:', {
    email,
    phoneNumber: phoneNumber || null,
    phoneCountry: phoneCountry || null
  });
  console.log('🔧 Supabase env present:', {
    url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });

  console.log('🔐 Creating Supabase auth user (or detecting existing)');
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

  if (authError) {
    console.error('❌ Supabase auth error:', authError.message);
    console.error('🔎 Supabase auth error details:', authError);
    // If already registered, try signing in directly
    if (authError.message?.toLowerCase().includes('already registered')) {
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr || !signInData.user) {
        return { error: `Impossible de se connecter: ${signInErr?.message || 'inconnu'}`, email, password };
      }
      // proceed with upsert below using signInData
    } else {
      return { error: `Échec de la création de l'utilisateur: ${authError.message}`, email, password };
    }
  }

  if (!authData?.user) {
    console.error('❌ No user returned from Supabase signup');
    return {
      error: 'Échec de la création de l\'utilisateur. Veuillez réessayer.',
      email,
      password
    };
  }

  console.log('✅ Supabase auth user created or signed in:', authData.user.id);

  // Upsert into public.users (id serial, email, password_hash, role)
  const roleFromPlan = (plan === 'personal' || plan === 'gift' || plan === 'family') ? plan : 'owner';
  const userRow: any = {
    email,
    password_hash: 'supabase_auth',
    role: roleFromPlan,
  };
  // Persist phone details if provided on signup
  if (phoneNumber && phoneCountry) {
    userRow.phone_number = phoneNumber;
    userRow.phone_country = phoneCountry;
  }
  const { error: upsertErr } = await supabase
    .from('users')
    .upsert(userRow, { onConflict: 'email' });

  if (upsertErr) {
    console.error('❌ users upsert error:', upsertErr.message);
    // continue, do not block auth session
  }
  
  // Log the account creation activity
  await logActivity(authData.user.id, 'account_created');
  
  console.log('🏠 Redirecting to dashboard');
  
  // Don't catch redirect errors - they need to bubble up
  redirect('/dashboard');
});

export async function signOut() {
  const supabase = await createClient();
  
  // Get current user before signing out
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    // Log the logout activity
    await logActivity(user.id, 'logout');
  }
  
  await supabase.auth.signOut();
  redirect('/connection');
}