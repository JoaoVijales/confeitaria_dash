import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { logError } from '@/lib/logger'

function getPlanFromProduct(productId: string): string {
  if (productId && productId === process.env.ABACATEPAY_PRODUCT_ID_BASIC) return 'basic'
  if (productId && productId === process.env.ABACATEPAY_PRODUCT_ID_PRO) return 'pro'
  return 'free'
}

function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.ABACATEPAY_WEBHOOK_SECRET ?? ''
  if (!secret || !signature) return false
  const expected = createHmac('sha256', secret).update(body).digest('hex')
  try {
    return timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

type SubscriptionPayload = {
  event: string
  data: {
    id: string
    customerId?: string
    metadata?: Record<string, string>
    items?: Array<{ productId: string }>
  }
}

async function resolveTenantId(
  supabase: ReturnType<typeof createClient>,
  customerId: string | undefined,
  metadataTenantId: string | undefined,
): Promise<string | null> {
  // Prefer lookup by customerId — prevents metadata spoofing
  if (customerId) {
    const { data } = await supabase
      .from('tenants')
      .select('id')
      .eq('abacate_customer_id', customerId)
      .single()
    if (data?.id) return data.id
  }
  // Fallback for first subscription (customerId not yet stored)
  return metadataTenantId ?? null
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-webhook-signature') ?? ''

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body) as SubscriptionPayload
  const supabase = createClient()

  switch (event.event) {
    case 'subscription.completed': {
      const tenantId = await resolveTenantId(
        supabase,
        event.data.customerId,
        event.data.metadata?.tenant_id,
      )
      if (!tenantId) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
      }

      const productId = event.data.items?.[0]?.productId ?? ''
      const plan = getPlanFromProduct(productId)

      const { error } = await supabase
        .from('tenants')
        .update({
          abacate_customer_id: event.data.customerId ?? null,
          abacate_subscription_id: event.data.id,
          plan,
          status: 'active',
        })
        .eq('id', tenantId)

      if (error) {
        logError('Webhook: falha ao atualizar tenant em subscription.completed', error, {
          service: 'abacatepay',
          operation: 'webhook.subscription.completed',
        })
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
      }
      break
    }

    case 'subscription.renewed': {
      const { error } = await supabase
        .from('tenants')
        .update({ status: 'active' })
        .eq('abacate_subscription_id', event.data.id)

      if (error) {
        logError('Webhook: falha ao renovar assinatura', error, {
          service: 'abacatepay',
          operation: 'webhook.subscription.renewed',
        })
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
      }
      break
    }

    case 'subscription.cancelled': {
      const { error } = await supabase
        .from('tenants')
        .update({ plan: 'free', status: 'active', abacate_subscription_id: null })
        .eq('abacate_subscription_id', event.data.id)

      if (error) {
        logError('Webhook: falha ao cancelar assinatura', error, {
          service: 'abacatepay',
          operation: 'webhook.subscription.cancelled',
        })
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
