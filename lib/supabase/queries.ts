import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db/drizzle';
import { users, teams, teamMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getCurrentUser() {
  const supabase = await createClient();
  
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  if (!authUser) {
    return null;
  }

  // Get user data from our database
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, authUser.email!))
    .limit(1);

  return user || null;
}

export async function getUserWithTeam(userId: number) {
  const userWithTeam = await db
    .select({
      user: users,
      team: teams,
      teamId: teamMembers.teamId
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .leftJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(users.id, userId))
    .limit(1);

  return userWithTeam[0] || null;
}

export async function getTeamForUser() {
  const user = await getCurrentUser();
  if (!user) return null;

  const userWithTeam = await getUserWithTeam(user.id);
  return userWithTeam?.team || null;
}