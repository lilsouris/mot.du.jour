'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircleIcon, Loader2, Eye, EyeOff } from 'lucide-react';
import { signIn, signUp } from './actions';
import { ActionState } from '@/lib/auth/middleware';
import { CountrySelector, countries, Country } from '@/components/country-selector';

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');
  const plan = searchParams.get('plan');
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<ActionState>({ error: '', email: '', password: '' });
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find(c => c.code === 'FR') || countries[0]
  );
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mode === 'signup') {
      setSelectedPlan(plan || null);
    }
  }, [mode, plan]);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const action = mode === 'signin' ? signIn : signUp;
      const result = await action(state, formData);
      if (result && typeof result === 'object') {
        setState((prev) => ({ ...prev, ...result }));
      }
      // On successful redirect, code path won't continue; if it does, keep previous state
    });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CircleIcon className="h-12 w-12 text-orange-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {mode === 'signin'
            ? 'Connectez-vous à votre compte'
            : 'Créez votre compte'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form className="space-y-6" action={handleSubmit}>
          <input type="hidden" name="redirect" value={redirect || ''} />
          <input type="hidden" name="priceId" value={priceId || ''} />
          <input type="hidden" name="inviteId" value={inviteId || ''} />
          <input type="hidden" name="plan" value={selectedPlan || ''} />

          {mode === 'signup' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-700">Choisissez votre formule</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { key: 'personal', title: 'Personnel', price: '4,99€ / mois' },
                  { key: 'gift', title: 'Cadeau', price: '4,99€ / mois' },
                  { key: 'family', title: 'Famille', price: '3,99€ / utilisateur' },
                ].map((p) => {
                  const isActive = selectedPlan === p.key;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setSelectedPlan(p.key)}
                      className={`text-left rounded-xl border p-4 transition-colors ${
                        isActive
                          ? 'border-orange-500 ring-1 ring-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      aria-pressed={isActive}
                    >
                      <div className="font-semibold text-gray-900">{p.title}</div>
                      <div className="text-sm text-gray-600">{p.price}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div>
            <Label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </Label>
            <div className="mt-1">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={state?.email || ''}
                required
                maxLength={50}
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Entrez votre email"
              />
            </div>
          </div>

          {mode === 'signup' && mounted && (
            <div>
              <CountrySelector
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
                phoneNumber={phoneNumber}
                onPhoneNumberChange={setPhoneNumber}
              />
            </div>
          )}

          <div>
            <Label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Mot de passe
            </Label>
            <div className="mt-1 relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={
                  mode === 'signin' ? 'current-password' : 'new-password'
                }
                defaultValue={state?.password || ''}
                required
                minLength={8}
                maxLength={100}
                className="appearance-none rounded-full relative block w-full px-3 pr-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Entrez votre mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-3 z-10 flex items-center justify-center text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {state?.error && (
            <div className="text-red-500 text-sm">{String(state.error)}</div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Chargement...
                </>
              ) : mode === 'signin' ? (
                'Se connecter'
              ) : (
                'S\'inscrire'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                {mode === 'signin'
                  ? 'Nouveau sur notre plateforme?'
                  : 'Vous avez déjà un compte?'}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href={`${mode === 'signin' ? '/inscription' : '/connection'}${
                redirect ? `?redirect=${redirect}` : ''
              }${priceId ? `&priceId=${priceId}` : ''}${plan ? `&plan=${plan}` : ''}`}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              {mode === 'signin'
                ? 'Créer un compte'
                : 'Se connecter à un compte existant'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}