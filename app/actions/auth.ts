'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getAdminAuth } from '@/lib/firebase/admin'
import { getFirebaseSession } from '@/lib/firebase/session'
import { createClient } from '@/lib/supabase/server'

const SESSION_COOKIE_DURATION_MS = 5 * 24 * 60 * 60 * 1000 // 5 days

export async function createSession(idToken: string) {
  const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
    expiresIn: SESSION_COOKIE_DURATION_MS,
  })

  const cookieStore = await cookies()
  cookieStore.set('__session', sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_COOKIE_DURATION_MS / 1000,
    path: '/',
  })
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete('__session')
  redirect('/login')
}

export async function createTenant(name: string): Promise<string> {
  const session = await getFirebaseSession()
  if (!session) throw new Error('Usuário não autenticado')

  const supabase = createClient()

  const { data: existing } = await supabase
    .from('tenants')
    .select('id')
    .eq('owner_uid', session.uid)
    .single()

  if (existing) return existing.id

  const { data, error } = await supabase
    .from('tenants')
    .insert({
      owner_uid: session.uid,
      name,
      plan: 'free',
      status: 'active',
    })
    .select('id')
    .single()

  if (error || !data) throw new Error('Erro ao criar tenant')

  revalidatePath('/dashboard')
  return data.id
}

export async function checkOnboarding(): Promise<boolean> {
  const session = await getFirebaseSession()
  if (!session) return false

  const supabase = createClient()
  const { data } = await supabase
    .from('tenants')
    .select('id')
    .eq('owner_uid', session.uid)
    .single()

  return !!data
}
