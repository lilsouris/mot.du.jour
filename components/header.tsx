'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Home, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/(login)/actions';
import { useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (res.status === 401) {
    return null; // Return null for unauthenticated users instead of throwing
  }
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  return res.json();
});

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR('/api/user', fetcher, {
    shouldRetryOnError: (error) => error.status !== 401,
    revalidateOnFocus: false,
    revalidateOnReconnect: true
  });
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    router.push('/');
  }

  if (!user) {
    return (
      <>
        <Link
          href="/#pricing"
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Tarifs
        </Link>
        <Button asChild variant="outline" className="rounded-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white">
          <Link href="/connection">Se connecter</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full bg-orange-500 text-white border-orange-500 hover:bg-transparent hover:text-orange-500">
          <Link href="/inscription">S'inscrire</Link>
        </Button>
      </>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9">
          <AvatarImage alt={String(user?.name || '')} />
          <AvatarFallback>
            {String(user?.email || user?.name || 'U')
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/dashboard" className="flex w-full items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>Tableau de bord</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="w-full flex-1 cursor-pointer"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <div className="h-6 w-6 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/>
              <path d="M15 3v6h6"/>
              <path d="M10 16s.8 1 2 1c1.3 0 2-1 2-1"/>
              <path d="M8 13h0"/>
              <path d="M16 13h0"/>
            </svg>
          </div>
          <span className="ml-2 text-xl font-semibold text-gray-900 hidden sm:block">Mot du jour</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}