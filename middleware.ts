import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/signup', '/onboarding']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get('__session')?.value
  const isPublicRoute = PUBLIC_ROUTES.some(r => pathname.startsWith(r))
  const isDashboardRoute = pathname.startsWith('/dashboard')

  // Unauthenticated: block dashboard access
  if (!sessionCookie && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Authenticated: redirect away from login/signup to dashboard
  if (sessionCookie && isPublicRoute && pathname !== '/onboarding') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}
