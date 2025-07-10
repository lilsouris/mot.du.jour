import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mot du jour API',
  description: 'Daily message webhooks for mental health messaging system.',
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}