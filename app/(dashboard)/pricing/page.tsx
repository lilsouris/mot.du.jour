'use client';

import { Button } from '@/components/ui/button';
import { checkoutAction } from '@/lib/payments/actions';
import { ArrowRight } from 'lucide-react';

export default function PricingPage() {
  return (
    <main className="flex-1">
      {/* Header */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Choisissez votre formule
          </h1>
          <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
            Commencez gratuitement, puis choisissez la formule qui vous convient
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Personal Plan */}
            <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">Personnel</h3>
                <div className="mt-4 flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900">4,99€</span>
                  <span className="ml-2 text-lg text-gray-500">/mois</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">ou 49,99€ facturé annuellement</p>
              </div>
              <ul className="mt-8 space-y-4">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Messages quotidiens personnalisés</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Journal numérique illimité</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Suivi de progression</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">14 jours d'essai gratuit</span>
                </li>
              </ul>
              <form action={checkoutAction} className="mt-8">
                <input type="hidden" name="priceId" value="price_personal_monthly" />
                <Button 
                  type="submit"
                  className="w-full bg-orange-500 text-white py-3 px-6 rounded-full font-semibold hover:bg-orange-600 transition-colors"
                >
                  Commencer l'essai gratuit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </div>

            {/* Gift Plan */}
            <div className="relative bg-white rounded-2xl shadow-lg border-2 border-orange-500 p-8">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Plus populaire
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">Cadeau</h3>
                <div className="mt-4 flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900">4,99€</span>
                  <span className="ml-2 text-lg text-gray-500">/mois</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">ou 49,99€ facturé annuellement</p>
              </div>
              <ul className="mt-8 space-y-4">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Parfait pour offrir</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Toutes les fonctionnalités personnelles</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Activation facile</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">14 jours d'essai gratuit</span>
                </li>
              </ul>
              <form action={checkoutAction} className="mt-8">
                <input type="hidden" name="priceId" value="price_gift_monthly" />
                <Button 
                  type="submit"
                  className="w-full bg-orange-500 text-white py-3 px-6 rounded-full font-semibold hover:bg-orange-600 transition-colors"
                >
                  Offrir maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </div>

            {/* Family Plan */}
            <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">Famille</h3>
                <div className="mt-4 flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900">3,99€</span>
                  <span className="ml-2 text-lg text-gray-500">/utilisateur/mois</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">utilisateurs illimités</p>
              </div>
              <ul className="mt-8 space-y-4">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Comptes famille illimités</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Toutes les fonctionnalités personnelles</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Gestion parentale</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">14 jours d'essai gratuit</span>
                </li>
              </ul>
              <form action={checkoutAction} className="mt-8">
                <input type="hidden" name="priceId" value="price_family_monthly" />
                <Button 
                  type="submit"
                  className="w-full bg-orange-500 text-white py-3 px-6 rounded-full font-semibold hover:bg-orange-600 transition-colors"
                >
                  Commencer l'essai gratuit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Questions fréquentes
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Puis-je annuler à tout moment ?
              </h3>
              <p className="text-gray-600">
                Oui, vous pouvez annuler votre abonnement à tout moment. 
                Aucun engagement, aucune pénalité.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                L'essai gratuit est-il vraiment gratuit ?
              </h3>
              <p className="text-gray-600">
                Absolument ! 14 jours d'accès complet sans aucune carte de crédit requise.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Comment fonctionne le plan famille ?
              </h3>
              <p className="text-gray-600">
                Chaque membre de la famille reçoit ses propres messages personnalisés. 
                Gérez tous les comptes depuis un tableau de bord principal.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Puis-je changer de plan plus tard ?
              </h3>
              <p className="text-gray-600">
                Oui, vous pouvez passer d'un plan à l'autre à tout moment depuis votre tableau de bord.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}