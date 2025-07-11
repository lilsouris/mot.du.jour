'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { validatedAction } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';

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
  console.log('🏠 Redirecting to dashboard');
  
  // Don't catch redirect errors - they need to bubble up
  redirect('/dashboard');
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  inviteId: z.string().optional()
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password } = data;
  const supabase = await createClient();

  console.log('🆕 Starting sign up process');
  console.log('📧 Attempting to sign up with email:', email);

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
  const { error: dbError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email,
      name: email.split('@')[0], // Use part before @ as default name
      role: 'owner'
    });

  if (dbError) {
    console.error('❌ Database error:', dbError.message);
    return {
      error: 'Échec de la création de l\'utilisateur. Veuillez réessayer.',
      email,
      password
    };
  }

  console.log('✅ User record created in database');
  console.log('🏠 Redirecting to dashboard');
  
  // Don't catch redirect errors - they need to bubble up
  redirect('/dashboard');
});

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/connection');
}