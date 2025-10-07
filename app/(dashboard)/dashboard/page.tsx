'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { customerPortalAction } from '@/lib/payments/actions';
import { useTransition } from 'react';
import useSWR from 'swr';
import { Suspense } from 'react';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle } from 'lucide-react';

type ActionState = {
  error?: string;
  success?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => {
  if (res.status === 401) {
    return null;
  }
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  return res.json();
});

function SubscriptionSkeleton() {
  return (
    <Card className="mb-8 h-[140px]">
      <CardHeader>
        <CardTitle>Abonnement</CardTitle>
      </CardHeader>
    </Card>
  );
}

function ManageSubscription() {
  const { data: user } = useSWR('/api/user', fetcher, {
    shouldRetryOnError: (error) => error.status !== 401,
    revalidateOnFocus: false,
    revalidateOnReconnect: true
  });

  const role = String(user?.role || '').toLowerCase();
  const planFromRole =
    role === 'personal' || role === 'personnel'
      ? 'Personnel'
      : role === 'gift'
      ? 'Cadeau'
      : role === 'family' || role === 'famille'
      ? 'Famille'
      : null;

  const hasPlan = Boolean(planFromRole);
  const isTeamPlan = role === 'family' || role === 'famille';
  const cardTitle = isTeamPlan ? 'Abonnement Équipe' : 'Abonnement';

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
              <p className="font-medium">
                Plan Actuel: {planFromRole || user?.plan_name || 'Gratuit'}
              </p>
              <p className="text-sm text-muted-foreground">
                {user?.subscription_status === 'active'
                  ? 'Facturation mensuelle'
                  : user?.subscription_status === 'trialing'
                  ? 'Période d\'essai'
                  : 'Aucun abonnement actif'}
              </p>
            </div>
            {hasPlan ? (
              <div className="flex items-center gap-2">
                <Button asChild variant="outline">
                  <a href="/pricing">Changer de Plan</a>
                </Button>
                <form action={customerPortalAction}>
                  <Button type="submit" variant="destructive">
                    Résilier
                  </Button>
                </form>
              </div>
            ) : user?.stripe_customer_id ? (
              <form action={customerPortalAction}>
                <Button type="submit" variant="outline">
                  Gérer l'Abonnement
                </Button>
              </form>
            ) : (
              <Button asChild variant="outline">
                <a href="/pricing">Choisir un Plan</a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMembersSkeleton() {
  return (
    <Card className="mb-8 h-[140px]">
      <CardHeader>
        <CardTitle>Membres</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4 mt-1">
          <div className="flex items-center space-x-4">
            <div className="size-8 rounded-full bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-3 w-14 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMembers() {
  const { data: user } = useSWR('/api/user', fetcher, {
    shouldRetryOnError: (error) => error.status !== 401,
    revalidateOnFocus: false,
    revalidateOnReconnect: true
  });

  const getUserDisplayName = (userData: any) => {
    const base = (userData?.name || userData?.email || 'Utilisateur Inconnu');
    return String(base);
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Membres</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          <li className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>
                  {(user?.name?.[0] ?? user?.email?.[0] ?? 'U').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                {user?.name && (
                  <p className="font-medium">
                    {user.name}
                  </p>
                )}
                {user?.phone_number && (
                  <p className="text-sm text-muted-foreground">
                    {user.phone_number}
                  </p>
                )}
              </div>
            </div>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}

function InviteTeamMemberSkeleton() {
  return (
    <Card className="h-[260px]">
      <CardHeader>
        <CardTitle>Inviter un Membre</CardTitle>
      </CardHeader>
    </Card>
  );
}

function InviteTeamMember() {
  const { data: user } = useSWR('/api/user', fetcher, {
    shouldRetryOnError: (error) => error.status !== 401,
    revalidateOnFocus: false,
    revalidateOnReconnect: true
  });
  const isOwner = user?.role === 'owner';

  // Placeholder invite function - you can implement this later
  const handleInvite = async (formData: FormData) => {
    console.log('Invite functionality - to be implemented');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inviter un Membre de l'Équipe</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleInvite} className="space-y-4">
          <div>
            <Label htmlFor="email" className="mb-2">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Entrez l'email"
              required
              disabled={!isOwner}
            />
          </div>
          <div>
            <Label>Rôle</Label>
            <RadioGroup
              defaultValue="member"
              name="role"
              className="flex space-x-4"
              disabled={!isOwner}
            >
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="member" id="member" />
                <Label htmlFor="member">Membre</Label>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="owner" id="owner" />
                <Label htmlFor="owner">Propriétaire</Label>
              </div>
            </RadioGroup>
          </div>
          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white"
            disabled={!isOwner}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Inviter un Membre
          </Button>
        </form>
      </CardContent>
      {!isOwner && (
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Vous devez être propriétaire de l'équipe pour inviter de nouveaux membres.
          </p>
        </CardFooter>
      )}
    </Card>
  );
}

export default function TeamSettingsPage() {
  const { data: user } = useSWR('/api/user', fetcher, {
    shouldRetryOnError: (error) => error.status !== 401,
    revalidateOnFocus: false,
    revalidateOnReconnect: true
  });
  
  // Determine if user is in a family/famille plan
  const isTeamPlan = user?.role === 'family' || user?.role === 'famille' || user?.plan_name?.toLowerCase().includes('family') || user?.plan_name?.toLowerCase().includes('famille');
  
  const pageTitle = isTeamPlan ? 'Paramètres de l\'Équipe' : 'Paramètres';
  
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">{pageTitle}</h1>
      <Suspense fallback={<SubscriptionSkeleton />}>
        <ManageSubscription />
      </Suspense>
      <Suspense fallback={<TeamMembersSkeleton />}>
        <TeamMembers />
      </Suspense>
      <Suspense fallback={<InviteTeamMemberSkeleton />}>
        <InviteTeamMember />
      </Suspense>
    </section>
  );
}