import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { logError, logWarn, logInfo } from '@/lib/logger'

function getPlanFromProduct(productId: string): string {
  if (productId && productId === process.env.ABACATEPAY_PRODUCT_ID_BASIC) return 'basic'
  if (productId && productId === process.env.ABACATEPAY_PRODUCT_ID_PRO) return 'pro'
  return 'free'
}

// AbacatePay envia o secret como query param ?webhookSecret=, não como header HMAC.
function verifyWebhookSecret(request: NextRequest): boolean {
  const secret = process.env.ABACATEPAY_WEBHOOK_SECRET ?? ''
  const provided = request.nextUrl.searchParams.get('webhookSecret') ?? ''
  if (!secret || !provided) return false
  try {
    return timingSafeEqual(Buffer.from(provided), Buffer.from(secret))
  } catch {
    return false
  }
}

// AbacatePay v2 payload structure (apiVersion: 2)
type SubscriptionPayload = {
  event: string
  data: {
    subscription: { id: string }
    customer: { id: string }
    checkout: {
      metadata?: Record<string, string>
      items?: Array<{ id: string }>
    }
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
  if (!verifyWebhookSecret(request)) {
    return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 400 })
  }

  const body = await request.text()

  const event = JSON.parse(body) as SubscriptionPayload
  const supabase = createClient()

  switch (event.event) {
    case 'subscription.completed': {
      const customerId = event.data.customer?.id
      const metadataTenantId = event.data.checkout.metadata?.tenant_id
      const subscriptionId = event.data.subscription.id

      const tenantId = await resolveTenantId(supabase, customerId, metadataTenantId)
      if (!tenantId) {
        logError('Webhook: tenant_id ausente no metadata e customer não encontrado no banco', null, {
          service: 'abacatepay',
          operation: 'webhook.subscription.completed',
          customerId,
          metadataTenantId,
          subscriptionId,
        })
        // Retorna 200 para evitar retentativas infinitas — sem tenant_id não há o que fazer
        return NextResponse.json({ received: true })
      }

      const productId = event.data.checkout.items?.[0]?.id ?? ''
      const plan = getPlanFromProduct(productId)

      if (plan === 'free') {
        logWarn('Webhook: subscription.completed com productId desconhecido — verifique as env vars ABACATEPAY_PRODUCT_ID_*', {
          service: 'abacatepay',
          operation: 'webhook.subscription.completed',
          tenantId,
          productId,
          subscriptionId,
        })
      }

      const { data: updated, error } = await supabase
        .from('tenants')
        .update({
          abacate_customer_id: customerId ?? null,
          abacate_subscription_id: subscriptionId,
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
          subscriptionId,
        })
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
      }

      if (!updated || updated.length === 0) {
        logError('Webhook: subscription.completed — nenhuma linha atualizada (tenant ausente no banco?)', null, {
          service: 'abacatepay',
          operation: 'webhook.subscription.completed',
          tenantId,
          subscriptionId,
        })
        return NextResponse.json({ received: true })
      }

      logInfo('Webhook: plano atualizado com sucesso', {
        service: 'abacatepay',
        operation: 'webhook.subscription.completed',
        tenantId,
        plan,
        subscriptionId,
      })
      break
    }

    case 'subscription.renewed': {
      const subscriptionId = event.data.subscription.id
      const { data: updated, error } = await supabase
        .from('tenants')
        .update({ status: 'active' })
        .eq('abacate_subscription_id', subscriptionId)
        .select('id')

      if (error) {
        logError('Webhook: falha ao renovar assinatura', error, {
          service: 'abacatepay',
          operation: 'webhook.subscription.renewed',
          subscriptionId,
        })
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
      }

      if (!updated || updated.length === 0) {
        logWarn('Webhook: subscription.renewed — subscription_id não encontrado no banco', {
          service: 'abacatepay',
          operation: 'webhook.subscription.renewed',
          subscriptionId,
        })
      } else {
        logInfo('Webhook: assinatura renovada com sucesso', {
          service: 'abacatepay',
          operation: 'webhook.subscription.renewed',
          subscriptionId,
        })
      }
      break
    }

    case 'subscription.cancelled': {
      const subscriptionId = event.data.subscription.id
      const { data: updated, error } = await supabase
        .from('tenants')
        .update({ plan: 'free', status: 'active', abacate_subscription_id: null })
        .eq('abacate_subscription_id', subscriptionId)
        .select('id')

      if (error) {
        logError('Webhook: falha ao cancelar assinatura', error, {
          service: 'abacatepay',
          operation: 'webhook.subscription.cancelled',
          subscriptionId,
        })
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
      }

      if (!updated || updated.length === 0) {
        logWarn('Webhook: subscription.cancelled — subscription_id não encontrado no banco', {
          service: 'abacatepay',
          operation: 'webhook.subscription.cancelled',
          subscriptionId,
        })
      } else {
        logInfo('Webhook: assinatura cancelada com sucesso', {
          service: 'abacatepay',
          operation: 'webhook.subscription.cancelled',
          subscriptionId,
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
