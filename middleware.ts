import { type NextRequest, NextResponse } from 'next/server';
// import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Temporarily disable middleware to fix server access
  return NextResponse.next();
  // return await updateSession(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs'
};
