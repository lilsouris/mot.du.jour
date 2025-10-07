'use server';

import { createClient } from '@/lib/supabase/server';

export type ActionState = {
  error?: string;
  success?: string;
};

export async function updateAccountInfo(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const name = (formData.get('name') as string || '').trim();
    const email = (formData.get('email') as string || '').trim();
    const phoneNumber = (formData.get('phoneNumber') as string || '').trim();
    const phoneCountry = (formData.get('phoneCountry') as string || '').trim();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Utilisateur non authentifié.' };
    }

    const updates: any = { name, email };
    if (phoneNumber) updates.phone_number = phoneNumber;
    if (phoneCountry) updates.phone_country = phoneCountry;

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('email', user.email as string); // email is our stable key

    if (error) {
      return { error: "Impossible de mettre à jour le compte." };
    }

    return { success: 'Compte mis à jour avec succès.' };
  } catch (e) {
    return { error: "Une erreur inattendue s'est produite." };
  }
}


