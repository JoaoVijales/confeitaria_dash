import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createClient } from '@/lib/supabase/server'

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
      const tenantId = event.data.metadata?.tenant_id
      if (!tenantId) break

      const productId = event.data.items?.[0]?.productId ?? ''
      const plan = getPlanFromProduct(productId)

      await supabase
        .from('tenants')
        .update({
          abacate_customer_id: event.data.customerId ?? null,
          abacate_subscription_id: event.data.id,
          plan,
          status: 'active',
        })
        .eq('id', tenantId)
      break
    }

    case 'subscription.renewed': {
      await supabase
        .from('tenants')
        .update({ status: 'active' })
        .eq('abacate_subscription_id', event.data.id)
      break
    }

    case 'subscription.cancelled': {
      await supabase
        .from('tenants')
        .update({ plan: 'free', status: 'active', abacate_subscription_id: null })
        .eq('abacate_subscription_id', event.data.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}
