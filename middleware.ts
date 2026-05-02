import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/signup', '/onboarding']

/**
 * Decodes the `exp` claim from a JWT without verifying its signature.
 * Safe for Edge Runtime. Full cryptographic verification (including revocation)
 * is performed server-side via getFirebaseSession() in Server Components.
 */
export function decodeSessionCookieExpiry(cookieValue: string): number | null {
  try {
    const parts = cookieValue.split('.')
    if (parts.length !== 3) return null
    const padded = parts[1].replace(/-/g, '+').replace(/_/g, '/') + '=='.slice((parts[1].length * 3) % 4 || 4)
    const payload = JSON.parse(atob(padded))
    return typeof payload.exp === 'number' ? payload.exp : null
  } catch {
    return null
  }
}

function isSessionValid(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false
  const exp = decodeSessionCookieExpiry(cookieValue)
  if (!exp) return false
  return Date.now() / 1000 < exp
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get('__session')?.value
  const isPublicRoute = PUBLIC_ROUTES.some(r => pathname.startsWith(r))
  const isDashboardRoute = pathname.startsWith('/dashboard')
  const authenticated = isSessionValid(sessionCookie)

  if (!authenticated && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (authenticated && isPublicRoute && pathname !== '/onboarding') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}
