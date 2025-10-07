import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Brain, MessageSquare } from 'lucide-react';
import { PhoneVisuals } from './(dashboard)/phone-visuals';
import { Header } from '@/components/header';

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Logged in users go to dashboard
    redirect('/dashboard');
  }

  // Non-logged in users see the landing page
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main>
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                  Découvrez votre
                  <span className="block text-orange-500">Mot du jour</span>
                </h1>
                <p className="mt-4 text-base text-gray-500 sm:mt-5 sm:text-lg lg:text-lg xl:text-xl px-4 sm:px-0">
                  Transformez votre mental en 2 minutes par jour. Recevez un
                  message personnalisé qui rewire votre cerveau pour plus de
                  bonheur, de confiance et de sérénité.
                </p>
                <div className="mt-6 sm:mt-8 sm:max-w-lg sm:mx-auto lg:text-left lg:mx-0">
                  <a href="/inscription">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-base sm:text-lg rounded-full bg-[#7C3AED] text-white border-[#7C3AED] hover:bg-transparent hover:text-[#7C3AED] w-full sm:w-auto"
                    >
                      Essayez gratuitement
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </a>
                </div>
              </div>
              <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                <PhoneVisuals />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-12 sm:py-16 bg-white w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-3 lg:gap-8">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white mx-auto lg:mx-0">
                  <Brain className="h-6 w-6" />
                </div>
                <div className="mt-4 lg:mt-5">
                  <h2 className="text-lg font-medium text-gray-900">
                    Rewiring neuroplastique
                  </h2>
                  <p className="mt-2 text-sm sm:text-base text-gray-500 px-4 sm:px-0">
                    Chaque message est conçu pour créer de nouveaux circuits
                    neuronaux positifs. 21 jours suffisent pour voir un
                    changement durable.
                  </p>
                </div>
              </div>

              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white mx-auto lg:mx-0">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div className="mt-4 lg:mt-5">
                  <h2 className="text-lg font-medium text-gray-900">
                    Messages uniques
                  </h2>
                  <p className="mt-2 text-sm sm:text-base text-gray-500 px-4 sm:px-0">
                    Aucun abonné ne reçoit le même texte en même temps.
                  </p>
                </div>
              </div>

              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white mx-auto lg:mx-0">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="mt-4 lg:mt-5">
                  <h2 className="text-lg font-medium text-gray-900">
                    Journal numérique
                  </h2>
                  <p className="mt-2 text-sm sm:text-base text-gray-500 px-4 sm:px-0">
                    Vide ton sac. Exprime-toi. Parle sans retenue. Envoie-nous
                    tes pensées, quand l'envie te prend.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center lg:text-left">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 px-4 sm:px-0">
                  Prêt à acquérir un esprit plus zen, plus motivé et plus ancré
                </h2>
                <p className="mt-4 text-base sm:text-lg text-gray-500 px-4 sm:px-0">
                  Rejoignez des milliers d'utilisateurs qui transforment leur
                  bien-être mental grâce à un message quotidien personnalisé.
                  Commencez votre voyage vers la sérénité dès aujourd'hui.
                </p>
              </div>
              <div className="mt-6 lg:mt-0 flex justify-center lg:justify-end">
                <a href="/inscription" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base sm:text-lg rounded-full bg-[#7C3AED] text-white border-[#7C3AED] hover:bg-transparent hover:text-[#7C3AED] w-full sm:w-auto"
                  >
                    Essayez gratuitement
                    <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 px-4 sm:px-0">
                Choisissez votre formule
              </h2>
              <p className="mt-4 text-lg sm:text-xl text-gray-500 px-4 sm:px-0">
                Commencez gratuitement, puis choisissez la formule qui vous
                convient
              </p>
            </div>
            <div className="mt-8 sm:mt-12 lg:mt-16 grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3 lg:gap-8">
              {/* Personal Plan */}
              <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 mx-4 sm:mx-0">
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Personnel
                  </h3>
                  <div className="mt-4 flex items-center justify-center">
                    <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                      4,99€
                    </span>
                    <span className="ml-2 text-base sm:text-lg text-gray-500">
                      /mois
                    </span>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-gray-500">
                    ou 49,99€ facturé annuellement
                  </p>
                </div>
                <ul className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-0.5">✓</span>
                    <span className="text-sm sm:text-base text-gray-700">
                      Messages quotidiens personnalisés
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-0.5">✓</span>
                    <span className="text-sm sm:text-base text-gray-700">
                      Journal numérique illimité
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-0.5">✓</span>
                    <span className="text-sm sm:text-base text-gray-700">
                      Suivi de progression
                    </span>
                  </li>
                </ul>
                <a href="/inscription?plan=personal">
                  <button className="mt-6 sm:mt-8 w-full bg-orange-500 text-white py-3 px-6 rounded-full text-sm sm:text-base font-semibold hover:bg-orange-600 transition-colors">
                    Commencer gratuitement
                  </button>
                </a>
              </div>

              {/* Gift Plan */}
              <div className="relative bg-white rounded-2xl shadow-lg border-2 border-orange-500 p-6 sm:p-8 mx-4 sm:mx-0">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-500 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold">
                    Plus populaire
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Cadeau
                  </h3>
                  <div className="mt-4 flex items-center justify-center">
                    <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                      4,99€
                    </span>
                    <span className="ml-2 text-base sm:text-lg text-gray-500">
                      /mois
                    </span>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-gray-500">
                    ou 49,99€ facturé annuellement
                  </p>
                </div>
                <ul className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-0.5">✓</span>
                    <span className="text-sm sm:text-base text-gray-700">
                      Parfait pour offrir
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-0.5">✓</span>
                    <span className="text-sm sm:text-base text-gray-700">
                      Toutes les fonctionnalités personnelles
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-0.5">✓</span>
                    <span className="text-sm sm:text-base text-gray-700">
                      Activation facile
                    </span>
                  </li>
                </ul>
                <a href="/inscription?plan=gift">
                  <button className="mt-6 sm:mt-8 w-full bg-orange-500 text-white py-3 px-6 rounded-full text-sm sm:text-base font-semibold hover:bg-orange-600 transition-colors">
                    Offrir maintenant
                  </button>
                </a>
              </div>

              {/* Family Plan */}
              <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 mx-4 sm:mx-0">
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Famille
                  </h3>
                  <div className="mt-4 flex items-center justify-center">
                    <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                      3,99€
                    </span>
                    <span className="ml-2 text-base sm:text-lg text-gray-500">
                      /utilisateur/mois
                    </span>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-gray-500">
                    utilisateurs illimités
                  </p>
                </div>
                <ul className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-0.5">✓</span>
                    <span className="text-sm sm:text-base text-gray-700">
                      Comptes famille illimités
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-0.5">✓</span>
                    <span className="text-sm sm:text-base text-gray-700">
                      Toutes les fonctionnalités personnelles
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-0.5">✓</span>
                    <span className="text-sm sm:text-base text-gray-700">
                      Gestion parentale
                    </span>
                  </li>
                </ul>
                <a href="/inscription?plan=family">
                  <button className="mt-6 sm:mt-8 w-full bg-orange-500 text-white py-3 px-6 rounded-full text-sm sm:text-base font-semibold hover:bg-orange-600 transition-colors">
                    Commencer gratuitement
                  </button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {/* Company Info */}
              <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start">
                  <span className="text-lg sm:text-xl font-semibold text-gray-900">
                    Mot du jour
                  </span>
                </div>
                <p className="text-gray-600 text-sm px-4 sm:px-0">
                  Transformez votre bien-être mental avec des messages
                  quotidiens personnalisés.
                </p>
              </div>

              {/* Product */}
              <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Produit
                </h4>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#features"
                      className="text-gray-600 hover:text-gray-900 text-sm"
                    >
                      Fonctionnalités
                    </a>
                  </li>
                  <li>
                    <a
                      href="#pricing"
                      className="text-gray-600 hover:text-gray-900 text-sm"
                    >
                      Tarifs
                    </a>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Support
                </h4>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-gray-900 text-sm"
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Légal
                </h4>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-gray-900 text-sm"
                    >
                      Confidentialité
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-gray-900 text-sm"
                    >
                      Conditions
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-gray-900 text-sm"
                    >
                      Cookies
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
              <p className="text-gray-600 text-sm">
                © 2025 Mot du jour. Tous droits réservés.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
