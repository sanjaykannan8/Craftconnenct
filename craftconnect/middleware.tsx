import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySecureToken } from './lib/auth-utils';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if the route is /Qr (case sensitive)
  if (pathname === '/Qr') {
    // Check if user is already authenticated with valid token
    const authToken = request.cookies.get('qr-auth')?.value;
    const isAuthenticated = authToken ? await verifySecureToken(authToken) : false;
    
    if (!isAuthenticated) {
      // Clear invalid/expired token
      const response = NextResponse.redirect(new URL('/auth?returnTo=' + pathname, request.url));
      response.cookies.delete('qr-auth');
      return response;
    }
  }
  
  // Handle authentication route
  if (pathname === '/auth') {
    const authToken = request.cookies.get('qr-auth')?.value;
    const isAuthenticated = authToken ? await verifySecureToken(authToken) : false;
    const returnTo = request.nextUrl.searchParams.get('returnTo');
    
    // If already authenticated and has returnTo, redirect back
    if (isAuthenticated && returnTo) {
      const url = request.nextUrl.clone();
      url.pathname = returnTo;
      url.searchParams.delete('returnTo');
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/Qr', '/auth']
};
