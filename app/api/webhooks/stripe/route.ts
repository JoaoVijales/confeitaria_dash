import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'

const PLAN_MAP: Record<string, string> = {
  [process.env.STRIPE_PRICE_ID_BASIC ?? '']: 'basic',
  [process.env.STRIPE_PRICE_ID_PRO ?? '']: 'pro',
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ''
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const tenantId = session.metadata?.tenant_id
      if (!tenantId) break

      // Valida que o tenant realmente existe antes de atualizar (evita injeção via metadata)
      const { data: tenantExists } = await supabase
        .from('tenants')
        .select('id')
        .eq('id', tenantId)
        .single()

      if (!tenantExists) break

      await supabase
        .from('tenants')
        .update({
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          status: 'active',
        })
        .eq('id', tenantId)
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const priceId = subscription.items.data[0]?.price.id ?? ''
      const plan = PLAN_MAP[priceId] ?? 'free'
      const status = subscription.status === 'active' ? 'active' : 'past_due'

      await supabase
        .from('tenants')
        .update({ plan, status, stripe_subscription_id: subscription.id })
        .eq('stripe_customer_id', subscription.customer as string)
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      await supabase
        .from('tenants')
        .update({ status: 'active' })
        .eq('stripe_customer_id', invoice.customer as string)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      await supabase
        .from('tenants')
        .update({ status: 'past_due' })
        .eq('stripe_customer_id', invoice.customer as string)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await supabase
        .from('tenants')
        .update({ plan: 'free', status: 'active', stripe_subscription_id: null })
        .eq('stripe_customer_id', subscription.customer as string)
      break
    }
  }

  return NextResponse.json({ received: true })
}
