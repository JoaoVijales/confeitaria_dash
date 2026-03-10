import { cookies } from 'next/headers'
import { adminAuth } from './admin'

export interface FirebaseSession {
  uid: string
  email?: string
}

export async function getFirebaseSession(): Promise<FirebaseSession | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('__session')?.value

  if (!sessionCookie) return null

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
    return { uid: decoded.uid, email: decoded.email }
  } catch {
    return null
  }
}
