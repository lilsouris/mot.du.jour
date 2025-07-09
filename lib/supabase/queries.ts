import { createClient } from '@/lib/supabase/server';
import { User, Team, TeamMember, UserWithTeam } from '@/lib/supabase/types';

export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      return null;
    }

    // Get user data from our database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', authUser.email!)
      .single();

    if (error) {
      // If user doesn't exist in our database yet, return null
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching user:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function getUserWithTeam(userId: string): Promise<UserWithTeam | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      team_members!inner (
        *,
        teams (*)
      )
    `)
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user with team:', error);
    return null;
  }

  if (!data || !data.team_members || data.team_members.length === 0) {
    return {
      user: data,
      team: null,
      teamMember: null
    };
  }

  const teamMember = data.team_members[0];
  const team = teamMember.teams;

  return {
    user: data,
    team: team || null,
    teamMember: teamMember || null
  };
}

export async function getTeamForUser(): Promise<Team | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const userWithTeam = await getUserWithTeam(user.id);
    return userWithTeam?.team || null;
  } catch (error) {
    console.error('Error getting team for user:', error);
    return null;
  }
}