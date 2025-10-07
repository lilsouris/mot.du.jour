import { createClient } from '@/lib/supabase/server';

export type ActivityAction =
  | 'password_change'
  | 'login'
  | 'logout'
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_cancelled'
  | 'message_sent'
  | 'account_created'
  | 'account_updated'
  | 'account_deleted';

export interface ActivityLog {
  id: string;
  user_id: string;
  action: ActivityAction;
  description: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export const ActivityDescriptions: Record<ActivityAction, string> = {
  password_change: 'Mot de passe modifié',
  login: 'Connexion',
  logout: 'Déconnexion',
  subscription_created: 'Abonnement créé',
  subscription_updated: 'Abonnement mis à jour',
  subscription_cancelled: 'Abonnement annulé',
  message_sent: 'Message envoyé',
  account_created: 'Compte créé',
  account_updated: 'Compte mis à jour',
  account_deleted: 'Compte supprimé',
};

export async function logActivity(
  userId: string,
  action: ActivityAction,
  metadata: Record<string, any> = {}
): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('activity_logs_account').insert({
      user_id: userId,
      action,
      description: ActivityDescriptions[action],
      metadata,
      timestamp: new Date().toISOString(),
    });

    if (error) {
      console.error('Error logging activity:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in logActivity:', error);
    return false;
  }
}

export async function getRecentActivities(
  userId: string,
  limit: number = 5,
  daysBack: number = 3
): Promise<ActivityLog[]> {
  try {
    const supabase = await createClient();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    const { data, error } = await supabase
      .from('activity_logs_account')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', cutoffDate.toISOString())
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching activities:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getRecentActivities:', error);
    return [];
  }
}

// Helper function to get user ID from current session
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user.id;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
}
