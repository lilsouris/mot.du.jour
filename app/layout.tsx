import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { getCurrentUser, getTeamForUser } from '@/lib/supabase/queries';
import { SWRConfig } from 'swr';

export const metadata: Metadata = {
  title: 'Mot du jour',
  description: 'Découvrez votre mot quotidien avec Mot du jour - une expérience d\'apprentissage élégante et personnalisée.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.ico', sizes: '32x32', type: 'image/x-icon' }
    ],
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'icon', url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
    ]
  }
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
      suppressHydrationWarning
    >
      <body className="min-h-[100dvh] bg-gray-50">
        <SWRConfig
          value={{
            fallback: {
              // We do NOT await here
              // Only components that read this data will suspend
              '/api/user': getCurrentUser(),
              '/api/team': getTeamForUser()
            }
          }}
        >
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}
