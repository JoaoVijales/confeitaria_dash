// Firebase Admin SDK requires Node.js runtime (não funciona em Edge Runtime)
export const runtime = 'nodejs'

import { NextResponse, type NextRequest } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'

const PUBLIC_ROUTES = ['/login', '/signup', '/onboarding']

async function verifySession(sessionCookie: string): Promise<boolean> {
  try {
    // checkRevoked=true garante que tokens revogados (logout forçado) sejam rejeitados
    await adminAuth.verifySessionCookie(sessionCookie, true)
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get('__session')?.value
  const isPublicRoute = PUBLIC_ROUTES.some(r => pathname.startsWith(r))
  const isDashboardRoute = pathname.startsWith('/dashboard')

  if (isDashboardRoute) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const valid = await verifySession(sessionCookie)
    if (!valid) {
      // Cookie inválido/expirado/revogado: limpa e redireciona
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('__session')
      return response
    }
  }

  // Usuário autenticado: redireciona de rotas públicas para dashboard
  if (sessionCookie && isPublicRoute && pathname !== '/onboarding') {
    const valid = await verifySession(sessionCookie)
    if (valid) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}
