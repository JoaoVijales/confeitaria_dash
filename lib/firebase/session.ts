import { cookies } from 'next/headers'
import { getAdminAuth } from './admin'
import { logError } from '@/lib/logger'

export interface FirebaseSession {
  uid: string
  email?: string
}

export async function getFirebaseSession(): Promise<FirebaseSession | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('__session')?.value

  if (!sessionCookie) return null

  try {
    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true)
    return { uid: decoded.uid, email: decoded.email }
  } catch (error) {
    logError('Erro ao verificar sessão Firebase', error, { service: 'firebase', operation: 'verifySessionCookie' })
    return null
  }
}
