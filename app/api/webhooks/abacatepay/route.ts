import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { logError, logWarn, logInfo } from '@/lib/logger'

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
    // AbacatePay echoes items with `id` (same field sent on checkout creation)
    items?: Array<{ id: string }>
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

      const productId = event.data.items?.[0]?.id ?? ''
      const plan = getPlanFromProduct(productId)

      if (plan === 'free') {
        logWarn('Webhook: subscription.completed com productId desconhecido — verifique as env vars ABACATEPAY_PRODUCT_ID_*', {
          service: 'abacatepay',
          operation: 'webhook.subscription.completed',
          tenantId,
          productId,
          subscriptionId: event.data.id,
        })
      }

      const { data: updated, error } = await supabase
        .from('tenants')
        .update({
          abacate_customer_id: event.data.customerId ?? null,
          abacate_subscription_id: event.data.id,
          plan,
          status: 'active',
        })
        .eq('id', tenantId)
        .select('id')

      if (error) {
        logError('Webhook: falha ao atualizar tenant em subscription.completed', error, {
          service: 'abacatepay',
          operation: 'webhook.subscription.completed',
          tenantId,
          subscriptionId: event.data.id,
        })
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
      }

      if (!updated || updated.length === 0) {
        logError('Webhook: subscription.completed — nenhuma linha atualizada (tenant ausente no banco?)', null, {
          service: 'abacatepay',
          operation: 'webhook.subscription.completed',
          tenantId,
          subscriptionId: event.data.id,
        })
        // Retorna 200 para não forçar retentativas infinitas da AbacatePay
        return NextResponse.json({ received: true })
      }

      logInfo('Webhook: plano atualizado com sucesso', {
        service: 'abacatepay',
        operation: 'webhook.subscription.completed',
        tenantId,
        plan,
        subscriptionId: event.data.id,
      })
      break
    }

    case 'subscription.renewed': {
      const { data: updated, error } = await supabase
        .from('tenants')
        .update({ status: 'active' })
        .eq('abacate_subscription_id', event.data.id)
        .select('id')

      if (error) {
        logError('Webhook: falha ao renovar assinatura', error, {
          service: 'abacatepay',
          operation: 'webhook.subscription.renewed',
          subscriptionId: event.data.id,
        })
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
      }

      if (!updated || updated.length === 0) {
        logWarn('Webhook: subscription.renewed — subscription_id não encontrado no banco', {
          service: 'abacatepay',
          operation: 'webhook.subscription.renewed',
          subscriptionId: event.data.id,
        })
      } else {
        logInfo('Webhook: assinatura renovada com sucesso', {
          service: 'abacatepay',
          operation: 'webhook.subscription.renewed',
          subscriptionId: event.data.id,
        })
      }
      break
    }

    case 'subscription.cancelled': {
      const { data: updated, error } = await supabase
        .from('tenants')
        .update({ plan: 'free', status: 'active', abacate_subscription_id: null })
        .eq('abacate_subscription_id', event.data.id)
        .select('id')

      if (error) {
        logError('Webhook: falha ao cancelar assinatura', error, {
          service: 'abacatepay',
          operation: 'webhook.subscription.cancelled',
          subscriptionId: event.data.id,
        })
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
      }

      if (!updated || updated.length === 0) {
        logWarn('Webhook: subscription.cancelled — subscription_id não encontrado no banco', {
          service: 'abacatepay',
          operation: 'webhook.subscription.cancelled',
          subscriptionId: event.data.id,
        })
      } else {
        logInfo('Webhook: assinatura cancelada com sucesso', {
          service: 'abacatepay',
          operation: 'webhook.subscription.cancelled',
          subscriptionId: event.data.id,
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
