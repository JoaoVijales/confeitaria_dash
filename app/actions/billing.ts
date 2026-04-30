'use server'

import { redirect } from 'next/navigation'
import { getFirebaseSession } from '@/lib/firebase/session'
import { createClient } from '@/lib/supabase/server'
import { abacatepay } from '@/lib/abacatepay/client'
import { logError } from '@/lib/logger'
import type { Plan } from '@/lib/utils/plan-limits'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

function getProductId(planKey: string): string {
  const map: Record<string, string | undefined> = {
    basic: process.env.ABACATEPAY_PRODUCT_ID_BASIC,
    pro:   process.env.ABACATEPAY_PRODUCT_ID_PRO,
    max:   process.env.ABACATEPAY_PRODUCT_ID_MAX,
  }
  return map[planKey] ?? ''
}

export async function createCheckoutSession(planKey: string) {
  const session = await getFirebaseSession()
  if (!session) throw new Error('Usuário não autenticado')

  const supabase = createClient()
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, abacate_customer_id')
    .eq('owner_uid', session.uid)
    .single()

  if (!tenant) throw new Error('Tenant não encontrado')

  const productId = getProductId(planKey)
  if (!productId) throw new Error('Plano inválido')

  const checkout = await abacatepay.subscriptions.create({
    items: [{ id: productId, quantity: 1 }],
    customerId: tenant.abacate_customer_id ?? undefined,
    returnUrl: `${APP_URL}/dashboard/billing`,
    completionUrl: `${APP_URL}/dashboard/billing?success=true`,
    metadata: { tenant_id: tenant.id },
  })

  redirect(checkout.url)
}

export async function getTenantPlan(): Promise<{ plan: Plan; name: string; status: string }> {
  const session = await getFirebaseSession()
  if (!session) throw new Error('Usuário não autenticado')

  const supabase = createClient()
  const { data, error } = await supabase
    .from('tenants')
    .select('plan, name, status')
    .eq('owner_uid', session.uid)
    .single()

  if (error || !data) {
    logError('Erro ao buscar plano do tenant', error, {
      service: 'supabase',
      operation: 'getTenantPlan',
      userId: session.uid,
    })
    return { plan: 'free', name: '', status: 'active' }
  }

  return { plan: data.plan as Plan, name: data.name as string, status: data.status as string }
}

export async function cancelSubscription() {
  const session = await getFirebaseSession()
  if (!session) throw new Error('Usuário não autenticado')

  const supabase = createClient()
  const { data: tenant } = await supabase
    .from('tenants')
    .select('abacate_subscription_id')
    .eq('owner_uid', session.uid)
    .single()

  if (!tenant?.abacate_subscription_id) throw new Error('Sem assinatura ativa')

  await abacatepay.subscriptions.cancel(tenant.abacate_subscription_id)
}
