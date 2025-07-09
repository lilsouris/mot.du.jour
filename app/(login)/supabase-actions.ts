'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq, or } from 'drizzle-orm';
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
      const [user] = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.phoneNumber, email))
        .limit(1);
      
      if (!user) {
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
  const supabase = await createClient();
  
  const result = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { email, password, phoneNumber, phoneCountry } = result.data;

  // Check if user already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return { error: 'Échec de la création de l\'utilisateur. Veuillez réessayer.' };
  }

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return { error: 'Échec de la création de l\'utilisateur. Veuillez réessayer.' };
  }

  // Create user in our database
  try {
    await db.insert(users).values({
      email,
      passwordHash: '', // Not needed with Supabase Auth
      phoneNumber: phoneNumber || null,
      phoneCountry: phoneCountry || null,
      role: 'owner'
    });
  } catch (error) {
    return { error: 'Échec de la création de l\'utilisateur. Veuillez réessayer.' };
  }

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    redirect(`/checkout?priceId=${priceId}`);
  }

  revalidatePath('/');
  redirect('/dashboard');
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