'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { logActivity } from '@/lib/activity/logger';

type ActionState = {
  error?: string;
  success?: string;
};

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string().min(1, 'Confirmation du mot de passe requise')
});

export async function updatePasswordAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Validate input
    const validation = updatePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword
    });

    if (!validation.success) {
      return {
        error: validation.error.errors[0].message
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        error: 'Le nouveau mot de passe et la confirmation ne correspondent pas.'
      };
    }

    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return {
        error: 'Utilisateur non authentifié. Veuillez vous reconnecter.'
      };
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      return {
        error: 'Erreur lors de la mise à jour du mot de passe. Veuillez réessayer.'
      };
    }

    // Log the password change activity
    await logActivity(user.id, 'password_change');

    return {
      success: 'Mot de passe mis à jour avec succès.'
    };

  } catch (error) {
    console.error('Password update error:', error);
    return {
      error: 'Une erreur inattendue s\'est produite. Veuillez réessayer.'
    };
  }
}

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Mot de passe requis'),
  confirmationPhrase: z.string().min(1, 'Phrase de confirmation requise')
});

export async function deleteAccountAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const password = formData.get('password') as string;
    const confirmationPhrase = formData.get('confirmationPhrase') as string;

    // Validate input
    const validation = deleteAccountSchema.safeParse({
      password,
      confirmationPhrase
    });

    if (!validation.success) {
      return {
        error: validation.error.errors[0].message
      };
    }

    // Validate confirmation phrase
    if (confirmationPhrase !== 'supprimer mon compte') {
      return {
        error: 'Veuillez saisir exactement "supprimer mon compte" pour confirmer.'
      };
    }

    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return {
        error: 'Utilisateur non authentifié. Veuillez vous reconnecter.'
      };
    }

    // Verify password by attempting to sign in (this confirms the current password)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password
    });

    if (authError) {
      return {
        error: 'Mot de passe incorrect. Veuillez réessayer.'
      };
    }

    // Delete user data from database tables
    // This will cascade delete related records due to foreign key constraints
    const { error: deleteUserError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);

    if (deleteUserError) {
      console.error('Error deleting user data:', deleteUserError);
      return {
        error: 'Erreur lors de la suppression des données utilisateur.'
      };
    }

    // Delete authentication user
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(user.id);

    if (deleteAuthError) {
      console.error('Error deleting auth user:', deleteAuthError);
      return {
        error: 'Erreur lors de la suppression du compte d\'authentification.'
      };
    }

    // Sign out and redirect
    await supabase.auth.signOut();
    
    // Redirect to a goodbye page or home page
    redirect('/connection?message=Compte supprimé avec succès. Au revoir!');

  } catch (error) {
    console.error('Account deletion error:', error);
    return {
      error: 'Une erreur inattendue s\'est produite lors de la suppression du compte.'
    };
  }
}

export async function addTeamMemberAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const phoneNumber = (formData.get('phone') as string || '').trim();
    if (!phoneNumber) {
      return { error: 'Numéro requis' };
    }

    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: 'Utilisateur non authentifié.' };
    }

    // Upsert team by owner user id (simple single-team model)
    const { data: teamRow } = await supabase
      .from('teams')
      .upsert({ owner_id: user.id }, { onConflict: 'owner_id' })
      .select('id')
      .single();

    const teamId = teamRow?.id;

    const insertRow: any = {
      user_id: user.id,
      team_id: teamId,
      role: 'member',
      phone_number: phoneNumber,
      joined_at: new Date().toISOString(),
    };

    const { error: insertErr } = await supabase.from('team_members').insert(insertRow);
    if (insertErr) {
      return { error: 'Erreur lors de l\'ajout du membre.' };
    }

    return { success: 'Numéro ajouté.' };
  } catch (e) {
    return { error: 'Une erreur inattendue s\'est produite.' };
  }
}