'use server'

import { redirect } from 'next/navigation'
import { getFirebaseSession } from '@/lib/firebase/session'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function createCheckoutSession(priceId: string) {
  const session = await getFirebaseSession()
  if (!session) throw new Error('Usuário não autenticado')

  const supabase = createClient()
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, stripe_customer_id')
    .eq('owner_uid', session.uid)
    .single()

  if (!tenant) throw new Error('Tenant não encontrado')

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: tenant.stripe_customer_id ?? undefined,
    customer_creation: tenant.stripe_customer_id ? undefined : 'always',
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${APP_URL}/dashboard/billing?success=true`,
    cancel_url: `${APP_URL}/dashboard/billing`,
    metadata: { tenant_id: tenant.id },
  })

  if (!checkoutSession.url) throw new Error('Erro ao criar checkout')

  redirect(checkoutSession.url)
}

export async function createBillingPortalSession() {
  const session = await getFirebaseSession()
  if (!session) throw new Error('Usuário não autenticado')

  const supabase = createClient()
  const { data: tenant } = await supabase
    .from('tenants')
    .select('stripe_customer_id')
    .eq('owner_uid', session.uid)
    .single()

  if (!tenant?.stripe_customer_id) throw new Error('Sem assinatura ativa')

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: tenant.stripe_customer_id,
    return_url: `${APP_URL}/dashboard/billing`,
  })

  redirect(portalSession.url)
}
