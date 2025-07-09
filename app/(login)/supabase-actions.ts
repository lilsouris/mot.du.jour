'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const signInSchema = z.object({
  email: z.string().min(3).max(255),
  password: z.string().min(8).max(100)
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  phoneNumber: z.string().optional(),
  phoneCountry: z.string().optional(),
  inviteId: z.string().optional()
});

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  
  const result = signInSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { email, password } = result.data;

  // Check if input is email or phone number
  const isPhoneNumber = /^\+?[1-9]\d{1,14}$/.test(email.replace(/\s/g, ''));
  
  let userEmail = email;
  
  // If it's a phone number, find the email associated with it
  if (isPhoneNumber) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('email')
        .eq('phone_number', email)
        .single();
      
      if (error || !user) {
        return { error: 'Numéro de téléphone ou mot de passe invalide. Veuillez réessayer.' };
      }
      
      userEmail = user.email;
    } catch (error) {
      return { error: 'Erreur lors de la vérification du numéro de téléphone.' };
    }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: userEmail,
    password,
  });

  if (error) {
    return { error: 'Email ou mot de passe invalide. Veuillez réessayer.' };
  }

  // If login with phone was successful, sync user data
  if (isPhoneNumber) {
    await syncUserData(supabase, userEmail);
  }

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    // Handle checkout redirect
    redirect(`/checkout?priceId=${priceId}`);
  }

  revalidatePath('/');
  redirect('/dashboard');
}

export async function signUp(formData: FormData) {
  const fs = require('fs');
  const logData = {
    timestamp: new Date().toISOString(),
    message: 'SUPABASE signUp function called',
    formData: Object.fromEntries(formData)
  };
  
  fs.appendFileSync('/Users/tj-index/mot-du-jour/signup-debug.log', JSON.stringify(logData) + '\n');
  
  console.log('🚀🚀🚀 SUPABASE signUp function called - THIS IS THE CORRECT ONE');
  console.log('🔥🔥🔥 Form data entries:', Object.fromEntries(formData));
  console.log('🎯🎯🎯 Function definitely started');
  
  try {
    console.log('📡 About to create Supabase client');
    const supabase = await createClient();
    console.log('✅ Supabase client created successfully');
    console.log('📋 Raw form data object:', Object.fromEntries(formData));
    
    // Check what we're getting for phone data
    const rawPhoneNumber = formData.get('phoneNumber');
    const rawPhoneCountry = formData.get('phoneCountry');
    console.log('📱 Phone number from form:', rawPhoneNumber);
    console.log('🌍 Phone country from form:', rawPhoneCountry);
  
    const result = signUpSchema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      console.error('❌ Validation error:', result.error.errors);
      return { error: result.error.errors[0].message };
    }
    
    console.log('✅ Validation passed');

    const { email, password, phoneNumber, phoneCountry } = result.data;

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return { error: 'Échec de la création de l\'utilisateur. Veuillez réessayer.' };
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error('Auth error:', authError);
      return { error: 'Échec de la création de l\'utilisateur. Veuillez réessayer.' };
    }

    if (!authData.user) {
      return { error: 'Échec de la création de l\'utilisateur. Veuillez réessayer.' };
    }

    // Create user in our database using the Auth user ID
    console.log('Creating user in database with:', {
      id: authData.user.id,
      email,
      phone_number: phoneNumber || null,
      phone_country: phoneCountry || null,
      role: 'owner'
    });

    const { error: dbError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id, // Use the Supabase Auth user ID
        email,
        password_hash: '', // Not needed with Supabase Auth
        phone_number: phoneNumber || null,
        phone_country: phoneCountry || null,
        role: 'owner'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      console.error('Full error details:', JSON.stringify(dbError, null, 2));
      return { error: 'Échec de la création de l\'utilisateur. Veuillez réessayer.' };
    }

    console.log('✅ User created successfully in database');

    const redirectTo = formData.get('redirect') as string | null;
    if (redirectTo === 'checkout') {
      const priceId = formData.get('priceId') as string;
      redirect(`/checkout?priceId=${priceId}`);
    }

    revalidatePath('/');
    redirect('/dashboard');
  } catch (error) {
    console.error('❌ Unexpected error in signUp:', error);
    console.error('❌ Error type:', typeof error);
    console.error('❌ Error message:', error?.message);
    console.error('❌ Error stack:', error?.stack);
    return { error: 'Échec de la création de l\'utilisateur. Veuillez réessayer.' };
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/');
  redirect('/');
}

async function syncUserData(supabase: any, email: string) {
  // This function can be used to sync additional user data if needed
  // For now, it's just a placeholder
  return;
}