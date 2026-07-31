import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('sivm_auth_session');
  const role = request.cookies.get('sivm_role')?.value;
  const path = request.nextUrl.pathname;
  
  // Exclude static paths
  if (path.startsWith('/_next') || path.startsWith('/api') || path.includes('favicon.ico')) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!session && !path.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session && role) {
    if (path.startsWith('/login')) {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
    
    // Protect role-based routes
    const allowedPath = `/${role}`;
    if (!path.startsWith(allowedPath) && (path.startsWith('/admin') || path.startsWith('/seller') || path.startsWith('/buyer'))) {
      return NextResponse.redirect(new URL(allowedPath, request.url));
    }
    
    // Root redirect
    if (path === '/') {
      return NextResponse.redirect(new URL(allowedPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
