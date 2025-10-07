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
import { AlertTriangle, Shield, Trash2, Eye, EyeOff } from 'lucide-react';
import { updatePasswordAction, deleteAccountAction } from '../security/actions';

type ActionState = {
  error?: string;
  success?: string;
  name?: string;
  email?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => {
  if (res.status === 401) {
    return null; // Return null for unauthenticated users instead of throwing
  }
  if (!res.ok) {
    const err: any = new Error('Network response was not ok');
    err.status = res.status;
    throw err;
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
  const [passwordPending, startPasswordTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const [passwordState, setPasswordState] = useState<{error?: string; success?: string}>({});
  const [deleteState, setDeleteState] = useState<{error?: string; success?: string}>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmationPhrase, setConfirmationPhrase] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
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

  const handlePasswordSubmit = (formDataPwd: FormData) => {
    startPasswordTransition(async () => {
      const result = await updatePasswordAction({}, formDataPwd);
      setPasswordState(result);
    });
  };

  const handleDeleteSubmit = (formDataDel: FormData) => {
    startDeleteTransition(async () => {
      const result = await deleteAccountAction({}, formDataDel);
      setDeleteState(result);
    });
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

      {/* Sécurité (migré depuis l'onglet Sécurité) */}
      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Changer le Mot de Passe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword" className="mb-2">Mot de passe actuel</Label>
                <div className="relative">
                  <Input id="currentPassword" name="currentPassword" type={showCurrent ? 'text' : 'password'} required disabled={passwordPending} placeholder="Entrez votre mot de passe actuel" className="pr-10" />
                  <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute inset-y-0 right-3 z-10 flex items-center text-gray-500 hover:text-gray-700" aria-label={showCurrent ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                    {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="newPassword" className="mb-2">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input id="newPassword" name="newPassword" type={showNew ? 'text' : 'password'} required minLength={8} disabled={passwordPending} placeholder="Entrez un nouveau mot de passe" className="pr-10" />
                  <button type="button" onClick={() => setShowNew(v => !v)} className="absolute inset-y-0 right-3 z-10 flex items-center text-gray-500 hover:text-gray-700" aria-label={showNew ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                    {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="mb-2">Confirmer le nouveau mot de passe</Label>
                <div className="relative">
                  <Input id="confirmPassword" name="confirmPassword" type={showConfirm ? 'text' : 'password'} required minLength={8} disabled={passwordPending} placeholder="Confirmez le nouveau mot de passe" className="pr-10" />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute inset-y-0 right-3 z-10 flex items-center text-gray-500 hover:text-gray-700" aria-label={showConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {passwordState.error && <div className="text-red-500 text-sm">{passwordState.error}</div>}
              {passwordState.success && <div className="text-green-500 text-sm">{passwordState.success}</div>}
              <Button type="submit" disabled={passwordPending} className="bg-orange-500 hover:bg-orange-600 text-white">
                {passwordPending ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Zone Dangereuse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-medium text-red-800 mb-2">Supprimer votre compte</h3>
                <p className="text-sm text-red-700 mb-4">Cette action est irréversible. Toutes vos données seront définitivement supprimées.</p>
                {!showDeleteConfirm ? (
                  <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50" onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer mon compte
                  </Button>
                ) : (
                  <form action={handleDeleteSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="confirmationPhrase" className="text-red-700 mb-2">Tapez "supprimer mon compte" pour confirmer</Label>
                      <Input id="confirmationPhrase" name="confirmationPhrase" type="text" required disabled={deletePending} placeholder="supprimer mon compte" className="border-red-300 focus:border-red-500" value={confirmationPhrase} onChange={(e) => setConfirmationPhrase(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="password" className="text-red-700 mb-2">Confirmez avec votre mot de passe</Label>
                      <Input id="password" name="password" type="password" required disabled={deletePending} placeholder="Entrez votre mot de passe pour confirmer" className="border-red-300 focus:border-red-500" />
                    </div>
                    {deleteState.error && <div className="text-red-500 text-sm">{deleteState.error}</div>}
                    {deleteState.success && <div className="text-green-500 text-sm">{deleteState.success}</div>}
                    <div className="flex space-x-3">
                      <Button type="submit" disabled={deletePending || confirmationPhrase !== 'supprimer mon compte'} variant="destructive">
                        {deletePending ? 'Suppression...' : 'Confirmer la suppression'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => { setShowDeleteConfirm(false); setConfirmationPhrase(''); }} disabled={deletePending}>Annuler</Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}