import { logError } from '@/lib/logger'

const BASE_URL = 'https://api.abacatepay.com/v2'

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY ?? ''}`,
        'Content-Type': 'application/json',
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    const json = (await res.json()) as { data: T; success: boolean; error: string | null }
    if (!json.success) {
      const errorMsg = json.error ?? 'AbacatePay API error'
      logError(`Erro na API AbacatePay: ${path}`, errorMsg, { service: 'abacatepay', path, method })
      throw new Error(errorMsg)
    }
    return json.data
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes('AbacatePay API error')) {
      logError(`Erro inesperado na chamada AbacatePay: ${path}`, error, { service: 'abacatepay', path, method })
    }
    throw error
  }
}

export interface SubscriptionCreateParams {
  items: Array<{ id: string; quantity: number }>
  customerId?: string
  returnUrl?: string
  completionUrl?: string
  metadata?: Record<string, string>
}

export interface SubscriptionCheckout {
  id: string
  url: string
}

export const abacatepay = {
  subscriptions: {
    create: (data: SubscriptionCreateParams) =>
      request<SubscriptionCheckout>('POST', '/subscriptions/create', data),
    cancel: (id: string) =>
      request<void>('POST', '/subscriptions/cancel', { id }),
  },
}
