import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  const { pathname } = request.nextUrl;

  // Public paths
  if (pathname === '/login' || pathname.startsWith('/api/auth')) {
    if (token && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userRole = (payload as any).role;

    // Protect Leader Dashboard
    if (pathname.startsWith('/leader/dashboard')) {
      if (userRole !== 'leader') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Protect Co-Leader Dashboard (Main Dashboard)
    // For this app, Leader can also view but read-only? 
    // Requirements say: "Leader only views analytics", "Co-Leader collections daily updates".
    // I'll allow Leader to view /dashboard but maybe redirect if they try to edit? 
    // Or strictly separate them.
    if (pathname.startsWith('/dashboard')) {
      if (userRole !== 'co_leader' && userRole !== 'leader') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      // If leader goes to /dashboard, should they be redirected to /leader/dashboard?
      if (userRole === 'leader' && pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/leader/dashboard', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
