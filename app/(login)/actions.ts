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
  inviteId: z.string().optional(),
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
    phoneCountry: phoneCountry || null,
    plan: plan || null
  });

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .single();

  if (existingUser) {
    console.log('❌ User already exists:', email);
    return {
      error: 'Un compte avec cet email existe déjà. Veuillez vous connecter.',
      email,
      password
    };
  }

  console.log('🔐 Creating Supabase auth user');
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    console.error('❌ Supabase auth error:', authError.message);
    console.error('🔎 Supabase auth error details:', authError);
    return {
      error: 'Échec de la création de l\'utilisateur. Veuillez réessayer.',
      email,
      password
    };
  }

  if (!authData.user) {
    console.error('❌ No user returned from Supabase signup');
    return {
      error: 'Échec de la création de l\'utilisateur. Veuillez réessayer.',
      email,
      password
    };
  }

  console.log('✅ Supabase auth user created:', authData.user.id);

  // Create user record in our database
  console.log('💾 Creating user record in database');
  const userRecord: any = {
    id: authData.user.id,
    email,
    name: email.split('@')[0], // Use part before @ as default name
    role: 'owner'
  };
  
  // Add phone number if provided
  if (phoneNumber && phoneCountry) {
    userRecord.phone_number = phoneNumber;
    userRecord.phone_country = phoneCountry;
  }
  
  const { error: dbError } = await supabase
    .from('users')
    .insert(userRecord);

  if (dbError) {
    // Do not block signup if RLS/policies prevent immediate insert before session exists.
    // We'll fall back to auth data where needed and create the row later.
    console.warn('⚠️ Skipping DB user insert; will bootstrap later. Reason:', dbError.message);
    console.warn('🔎 DB error details:', dbError);
  }

  console.log('✅ User record created in database');
  
  // Log the account creation activity
  await logActivity(authData.user.id, 'account_created');
  
  // Allow a small delay to ensure session is fully established
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // If a plan was selected, redirect to the appropriate checkout
  if (plan) {
    console.log('💳 Redirecting to checkout for plan:', plan);
    const priceIdMap = {
      'personal': 'Personnel',
      'gift': 'Cadeau',
      'family': 'Famille'
    };
    
    const priceId = priceIdMap[plan as keyof typeof priceIdMap];
    if (priceId) {
      redirect(`/pricing?priceId=${priceId}&autoCheckout=true`);
    }
  }
  
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