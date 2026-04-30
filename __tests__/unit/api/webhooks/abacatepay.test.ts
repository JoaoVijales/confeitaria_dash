import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockLogError = vi.fn()
const mockLogWarn = vi.fn()
const mockLogInfo = vi.fn()
vi.mock('@/lib/logger', () => ({
  logError: (...args: unknown[]) => mockLogError(...args),
  logWarn: (...args: unknown[]) => mockLogWarn(...args),
  logInfo: (...args: unknown[]) => mockLogInfo(...args),
}))

const mockSingle = vi.fn()
const mockEqTenant = vi.fn(() => ({ single: mockSingle }))
const mockSelectTenants = vi.fn(() => ({ eq: mockEqTenant }))

const mockSelectAfterUpdate = vi.fn()
const mockEqSub = vi.fn(() => ({ select: mockSelectAfterUpdate }))
const mockUpdateTenants = vi.fn(() => ({ eq: mockEqSub }))

const mockFrom = vi.fn((table: string) => {
  if (table === 'tenants') {
    return { select: mockSelectTenants, update: mockUpdateTenants }
  }
  return {}
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
}))

import { POST } from '@/app/api/webhooks/abacatepay/route'

const WEBHOOK_SECRET = 'test-webhook-secret'

function makeRequest(body: object, secret?: string): NextRequest {
  const bodyStr = JSON.stringify(body)
  const s = secret ?? WEBHOOK_SECRET
  return new NextRequest(
    `http://localhost/api/webhooks/abacatepay?webhookSecret=${s}`,
    { method: 'POST', body: bodyStr },
  )
}

// AbacatePay v2 nested payload structure
function makeCompletedPayload(overrides?: {
  subscriptionId?: string
  customerId?: string
  productId?: string
  tenantId?: string
}) {
  return {
    event: 'subscription.completed',
    data: {
      subscription: { id: overrides?.subscriptionId ?? 'sub_123' },
      customer: { id: overrides?.customerId ?? 'cust_456' },
      checkout: {
        metadata: overrides?.tenantId ? { tenant_id: overrides.tenantId } : undefined,
        items: [{ id: overrides?.productId ?? 'prod_basic' }],
      },
    },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.ABACATEPAY_WEBHOOK_SECRET = WEBHOOK_SECRET
  process.env.ABACATEPAY_PRODUCT_ID_BASIC = 'prod_basic'
  process.env.ABACATEPAY_PRODUCT_ID_PRO = 'prod_pro'
  process.env.ABACATEPAY_PRODUCT_ID_MAX = 'prod_max'
})

describe('POST /api/webhooks/abacatepay', () => {
  describe('verificação de assinatura', () => {
    it('retorna 400 quando secret é inválido', async () => {
      const req = makeRequest({ event: 'subscription.completed', data: {} }, 'wrong-secret')
      const res = await POST(req)
      expect(res.status).toBe(400)
    })

    it('retorna 400 quando webhookSecret está ausente', async () => {
      const bodyStr = JSON.stringify({ event: 'subscription.completed', data: {} })
      const req = new NextRequest('http://localhost/api/webhooks/abacatepay', {
        method: 'POST',
        body: bodyStr,
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
    })
  })

  describe('subscription.completed', () => {
    it('retorna 200 (sem atualizar) quando tenant não é encontrado — evita retentativas infinitas', async () => {
      mockSingle.mockResolvedValueOnce({ data: null })

      const payload = makeCompletedPayload() // sem metadata.tenant_id
      const req = makeRequest(payload)
      const res = await POST(req)

      expect(res.status).toBe(200)
      expect(mockLogError).toHaveBeenCalled()
      expect(mockUpdateTenants).not.toHaveBeenCalled()
    })

    it('atualiza tenant e retorna 200 para plano basic', async () => {
      mockSingle.mockResolvedValueOnce({ data: { id: 'tenant_1' } })
      mockSelectAfterUpdate.mockResolvedValueOnce({ data: [{ id: 'tenant_1' }], error: null })

      const req = makeRequest(makeCompletedPayload())
      const res = await POST(req)

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.received).toBe(true)
      expect(mockUpdateTenants).toHaveBeenCalledWith(
        expect.objectContaining({ plan: 'basic', abacate_subscription_id: 'sub_123' }),
      )
    })

    it('mapeia product_id pro para plano pro', async () => {
      mockSingle.mockResolvedValueOnce({ data: { id: 'tenant_1' } })
      mockSelectAfterUpdate.mockResolvedValueOnce({ data: [{ id: 'tenant_1' }], error: null })

      const req = makeRequest(makeCompletedPayload({ productId: 'prod_pro' }))
      await POST(req)

      expect(mockUpdateTenants).toHaveBeenCalledWith(
        expect.objectContaining({ plan: 'pro' }),
      )
    })

    it('mapeia product_id max para plano max', async () => {
      mockSingle.mockResolvedValueOnce({ data: { id: 'tenant_1' } })
      mockSelectAfterUpdate.mockResolvedValueOnce({ data: [{ id: 'tenant_1' }], error: null })

      const req = makeRequest(makeCompletedPayload({ productId: 'prod_max' }))
      await POST(req)

      expect(mockUpdateTenants).toHaveBeenCalledWith(
        expect.objectContaining({ plan: 'max' }),
      )
    })

    it('retorna 500 quando DB falha ao atualizar', async () => {
      mockSingle.mockResolvedValueOnce({ data: { id: 'tenant_1' } })
      mockSelectAfterUpdate.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } })

      const req = makeRequest(makeCompletedPayload())
      const res = await POST(req)

      expect(res.status).toBe(500)
      expect(mockLogError).toHaveBeenCalled()
    })

    it('usa checkout.metadata.tenant_id como fallback quando customer não encontra tenant', async () => {
      // customerId não encontra nada no banco
      mockSingle.mockResolvedValueOnce({ data: null })
      mockSelectAfterUpdate.mockResolvedValueOnce({ data: [{ id: 'tenant_meta' }], error: null })

      const payload = makeCompletedPayload({ tenantId: 'tenant_meta' })
      const req = makeRequest(payload)
      const res = await POST(req)

      expect(res.status).toBe(200)
      expect(mockUpdateTenants).toHaveBeenCalledWith(
        expect.objectContaining({ plan: 'basic' }),
      )
    })
  })

  describe('subscription.renewed', () => {
    it('atualiza status para active e retorna 200', async () => {
      mockSelectAfterUpdate.mockResolvedValueOnce({ data: [{ id: 'tenant_1' }], error: null })

      const req = makeRequest({
        event: 'subscription.renewed',
        data: { subscription: { id: 'sub_123' }, customer: { id: 'cust_456' }, checkout: {} },
      })
      const res = await POST(req)

      expect(res.status).toBe(200)
      expect(mockUpdateTenants).toHaveBeenCalledWith({ status: 'active' })
    })

    it('retorna 500 quando DB falha', async () => {
      mockSelectAfterUpdate.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } })

      const req = makeRequest({
        event: 'subscription.renewed',
        data: { subscription: { id: 'sub_123' }, customer: { id: 'cust_456' }, checkout: {} },
      })
      const res = await POST(req)

      expect(res.status).toBe(500)
    })
  })

  describe('subscription.cancelled', () => {
    it('bloqueia acesso (status=cancelled) sem alterar o plano e retorna 200', async () => {
      mockSelectAfterUpdate.mockResolvedValueOnce({ data: [{ id: 'tenant_1' }], error: null })

      const req = makeRequest({
        event: 'subscription.cancelled',
        data: { subscription: { id: 'sub_123' }, customer: { id: 'cust_456' }, checkout: {} },
      })
      const res = await POST(req)

      expect(res.status).toBe(200)
      expect(mockUpdateTenants).toHaveBeenCalledWith({
        status: 'cancelled',
        abacate_subscription_id: null,
      })
    })
  })

  describe('evento desconhecido', () => {
    it('retorna 200 sem processar', async () => {
      const req = makeRequest({ event: 'unknown.event', data: { subscription: { id: 'x' }, customer: { id: 'y' }, checkout: {} } })
      const res = await POST(req)
      expect(res.status).toBe(200)
    })
  })
})
