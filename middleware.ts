import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

// Routes yang memerlukan authentication
const protectedRoutes = ['/superuser/dashboard', '/api/admin'];

// Routes yang hanya untuk user yang belum login
const authRoutes = ['/superuser'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if route is protected (admin routes)
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname === route);
  
  // Get token from cookie
  const token = request.cookies.get('admin-token')?.value;
  
  // Verify token
  let isAuthenticated = false;
  if (token) {
    const payload = await verifyToken(token);
    isAuthenticated = !!payload;
  }
  
  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const url = new URL('/superuser', request.url);
    url.searchParams.set('error', 'unauthorized');
    return NextResponse.redirect(url);
  }
  
  // Redirect authenticated users away from auth pages
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/superuser/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/superuser/:path*',
    '/api/admin/:path*',
  ],
};
