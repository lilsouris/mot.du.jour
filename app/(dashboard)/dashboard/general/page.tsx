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
import { useState, useEffect } from 'react';
import { CountrySelector, countries, Country } from '@/components/country-selector';

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
  const { data: user } = useSWR('/api/user', fetcher, {
    shouldRetryOnError: (error) => {
      // Retry on network errors but not on 401 (unauthorized)
      return error.status !== 401;
    },
    revalidateOnFocus: false,
    revalidateOnReconnect: true
  });
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<ActionState>({});
  
  // Form state for tracking changes
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    phoneCountry: ''
  });
  
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find(c => c.code === 'FR') || countries[0]
  );
  
  const [hasChanges, setHasChanges] = useState(false);
  
  // Update form data when user data loads
  useEffect(() => {
    if (user) {
      const newFormData = {
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phone_number || '',
        phoneCountry: user.phone_country || '+33'
      };
      setFormData(newFormData);
      
      // Set selected country based on user's phone country
      if (user.phone_country) {
        const country = countries.find(c => c.dialCode === user.phone_country);
        if (country) {
          setSelectedCountry(country);
        }
      }
    }
  }, [user]);
  
  // Check for changes
  useEffect(() => {
    if (user) {
      const hasNameChange = formData.name !== (user.name || '');
      const hasEmailChange = formData.email !== (user.email || '');
      const hasPhoneChange = formData.phoneNumber !== (user.phone_number || '');
      const hasCountryChange = selectedCountry.dialCode !== (user.phone_country || '+33');
      
      setHasChanges(hasNameChange || hasEmailChange || hasPhoneChange || hasCountryChange);
    }
  }, [formData, selectedCountry, user]);
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
  };
  
  const handlePhoneNumberChange = (phoneNumber: string) => {
    setFormData(prev => ({ ...prev, phoneNumber }));
  };

  const handleSubmit = (formDataObj: FormData) => {
    startTransition(async () => {
      const name = formDataObj.get('name') as string;
      const email = formDataObj.get('email') as string;
      const phoneNumber = formDataObj.get('phoneNumber') as string;
      const phoneCountry = formDataObj.get('phoneCountry') as string;

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For now, just return success
      setState({
        success: 'Compte mis à jour avec succès.',
        name,
        email
      });
      
      // Update form data to match submitted values
      setFormData({
        name,
        email,
        phoneNumber,
        phoneCountry
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
              <Label htmlFor="name" className="mb-2">Nom</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Votre nom complet"
                required
                disabled={isPending}
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="mb-2">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="votre.email@exemple.com"
                required
                disabled={isPending}
              />
            </div>
            
            <div>
              <Label className="mb-2">Numéro de téléphone</Label>
              <CountrySelector
                selectedCountry={selectedCountry}
                onCountryChange={handleCountryChange}
                phoneNumber={formData.phoneNumber}
                onPhoneNumberChange={handlePhoneNumberChange}
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
              disabled={isPending || !hasChanges}
              className="bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Mise à jour...' : 'Mettre à jour le compte'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}