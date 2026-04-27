import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createHmac } from 'crypto'
import { NextRequest } from 'next/server'

const mockLogError = vi.fn()
vi.mock('@/lib/logger', () => ({
  logError: (...args: unknown[]) => mockLogError(...args),
}))

const mockUpdate = vi.fn()
const mockSingle = vi.fn()
const mockEqTenant = vi.fn(() => ({ single: mockSingle }))
const mockEqSub = vi.fn()
const mockSelectTenants = vi.fn(() => ({ eq: mockEqTenant }))
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

function sign(body: string): string {
  return createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex')
}

function makeRequest(body: object, signature?: string): NextRequest {
  const bodyStr = JSON.stringify(body)
  const sig = signature ?? sign(bodyStr)
  return new NextRequest('http://localhost/api/webhooks/abacatepay', {
    method: 'POST',
    body: bodyStr,
    headers: { 'x-webhook-signature': sig },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.ABACATEPAY_WEBHOOK_SECRET = WEBHOOK_SECRET
  process.env.ABACATEPAY_PRODUCT_ID_BASIC = 'prod_basic'
  process.env.ABACATEPAY_PRODUCT_ID_PRO = 'prod_pro'
})

describe('POST /api/webhooks/abacatepay', () => {
  describe('verificação de assinatura', () => {
    it('retorna 400 quando assinatura é inválida', async () => {
      const req = makeRequest({ event: 'subscription.completed', data: {} }, 'invalid-sig')
      const res = await POST(req)
      expect(res.status).toBe(400)
    })

    it('retorna 400 quando assinatura está ausente', async () => {
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
    const payload = {
      event: 'subscription.completed',
      data: {
        id: 'sub_123',
        customerId: 'cust_456',
        items: [{ productId: 'prod_basic' }],
      },
    }

    it('retorna 404 quando tenant nao é encontrado', async () => {
      mockSingle.mockResolvedValueOnce({ data: null })

      const req = makeRequest(payload)
      const res = await POST(req)

      expect(res.status).toBe(404)
    })

    it('atualiza tenant e retorna 200 para plano basic', async () => {
      mockSingle.mockResolvedValueOnce({ data: { id: 'tenant_1' } })
      mockEqSub.mockResolvedValueOnce({ error: null })

      const req = makeRequest(payload)
      const res = await POST(req)

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.received).toBe(true)
    })

    it('mapeia product_id pro para plano pro', async () => {
      const proPload = {
        event: 'subscription.completed',
        data: { id: 'sub_123', customerId: 'cust_456', items: [{ productId: 'prod_pro' }] },
      }

      mockSingle.mockResolvedValueOnce({ data: { id: 'tenant_1' } })
      mockEqSub.mockResolvedValueOnce({ error: null })

      const req = makeRequest(proPload)
      await POST(req)

      expect(mockUpdateTenants).toHaveBeenCalledWith(
        expect.objectContaining({ plan: 'pro' })
      )
    })

    it('retorna 500 quando DB falha ao atualizar', async () => {
      mockSingle.mockResolvedValueOnce({ data: { id: 'tenant_1' } })
      mockEqSub.mockResolvedValueOnce({ error: { message: 'DB error' } })

      const req = makeRequest(payload)
      const res = await POST(req)

      expect(res.status).toBe(500)
      expect(mockLogError).toHaveBeenCalled()
    })

    it('usa metadata.tenant_id como fallback quando customerId nao encontra tenant', async () => {
      const payloadWithMeta = {
        event: 'subscription.completed',
        data: {
          id: 'sub_123',
          customerId: undefined,
          metadata: { tenant_id: 'tenant_meta' },
          items: [{ productId: 'prod_basic' }],
        },
      }

      mockEqSub.mockResolvedValueOnce({ error: null })

      const req = makeRequest(payloadWithMeta)
      const res = await POST(req)

      expect(res.status).toBe(200)
    })
  })

  describe('subscription.renewed', () => {
    it('atualiza status para active e retorna 200', async () => {
      mockEqSub.mockResolvedValueOnce({ error: null })

      const req = makeRequest({ event: 'subscription.renewed', data: { id: 'sub_123' } })
      const res = await POST(req)

      expect(res.status).toBe(200)
      expect(mockUpdateTenants).toHaveBeenCalledWith({ status: 'active' })
    })

    it('retorna 500 quando DB falha', async () => {
      mockEqSub.mockResolvedValueOnce({ error: { message: 'DB error' } })

      const req = makeRequest({ event: 'subscription.renewed', data: { id: 'sub_123' } })
      const res = await POST(req)

      expect(res.status).toBe(500)
    })
  })

  describe('subscription.cancelled', () => {
    it('rebaixa para plano free e retorna 200', async () => {
      mockEqSub.mockResolvedValueOnce({ error: null })

      const req = makeRequest({ event: 'subscription.cancelled', data: { id: 'sub_123' } })
      const res = await POST(req)

      expect(res.status).toBe(200)
      expect(mockUpdateTenants).toHaveBeenCalledWith({
        plan: 'free',
        status: 'active',
        abacate_subscription_id: null,
      })
    })
  })

  describe('evento desconhecido', () => {
    it('retorna 200 sem processar', async () => {
      const req = makeRequest({ event: 'unknown.event', data: { id: 'x' } })
      const res = await POST(req)
      expect(res.status).toBe(200)
    })
  })
})
