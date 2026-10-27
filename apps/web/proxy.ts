import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Ubah nama fungsi dari 'middleware' menjadi 'proxy'
export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');
  const isOAuthCallback = request.nextUrl.pathname === '/auth/callback';

  if (!token && isDashboardPage) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (token && isAuthPage && !isOAuthCallback) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};