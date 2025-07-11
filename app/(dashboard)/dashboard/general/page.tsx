'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTransition } from 'react';
import useSWR, { mutate } from 'swr';
import { useState } from 'react';

type ActionState = {
  error?: string;
  success?: string;
  name?: string;
  email?: string;
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

export default function GeneralPage() {
  const { data: user } = useSWR('/api/user', fetcher);
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<ActionState>({});

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const name = formData.get('name') as string;
      const email = formData.get('email') as string;

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For now, just return success
      setState({
        success: 'Compte mis à jour avec succès.',
        name,
        email
      });
    });
  };

  if (!user) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Paramètres Généraux</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Informations du Compte</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={state.name || user.name || ''}
                placeholder="Votre nom complet"
                required
                disabled={isPending}
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={state.email || user.email || ''}
                placeholder="votre.email@exemple.com"
                required
                disabled={isPending}
              />
            </div>

            {state.error && (
              <div className="text-red-500 text-sm">{state.error}</div>
            )}

            {state.success && (
              <div className="text-green-500 text-sm">{state.success}</div>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isPending ? 'Mise à jour...' : 'Mettre à jour le compte'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}