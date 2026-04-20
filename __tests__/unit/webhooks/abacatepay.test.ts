import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createHmac } from 'crypto'

const mockFrom = vi.hoisted(() => vi.fn())
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
}))

import { POST } from '@/app/api/webhooks/abacatepay/route'
import { NextRequest } from 'next/server'

const WEBHOOK_SECRET = 'test-secret-123'

function makeRequest(body: object, secret = WEBHOOK_SECRET): NextRequest {
  const bodyStr = JSON.stringify(body)
  const sig = createHmac('sha256', secret).update(bodyStr).digest('hex')
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
    it('retorna 400 com assinatura inválida', async () => {
      const req = new NextRequest('http://localhost/api/webhooks/abacatepay', {
        method: 'POST',
        body: JSON.stringify({ event: 'subscription.completed', data: {} }),
        headers: { 'x-webhook-signature': 'invalid-sig' },
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
    })

    it('retorna 400 sem assinatura', async () => {
      const req = new NextRequest('http://localhost/api/webhooks/abacatepay', {
        method: 'POST',
        body: JSON.stringify({ event: 'subscription.completed', data: {} }),
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
    })
  })

  describe('subscription.completed', () => {
    it('busca tenant pelo customerId quando já cadastrado (não confia em metadata)', async () => {
      const eqSingleMock = vi.fn().mockResolvedValue({ data: { id: 'tenant-from-db' }, error: null })
      const eqMock = vi.fn().mockReturnValue({ single: eqSingleMock })
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
      const eqUpdateTenant = vi.fn().mockResolvedValue({ data: null, error: null })
      const eqUpdateId = vi.fn().mockReturnValue({ eq: eqUpdateTenant })
      const updateMock = vi.fn().mockReturnValue({ eq: eqUpdateId })

      mockFrom
        .mockReturnValueOnce({ select: selectMock })  // lookup by customerId
        .mockReturnValueOnce({ update: updateMock })  // update tenant

      const req = makeRequest({
        event: 'subscription.completed',
        data: {
          id: 'sub_123',
          customerId: 'cus_abc',
          metadata: { tenant_id: 'DIFFERENT-TENANT-FROM-ATTACKER' },
          items: [{ productId: 'prod_basic' }],
        },
      })
      const res = await POST(req)

      expect(res.status).toBe(200)
      // Deve usar tenant-from-db (lookup pelo customerId), não o metadata
      expect(eqUpdateId).toHaveBeenCalledWith('id', 'tenant-from-db')
    })

    it('usa metadata.tenant_id como fallback na primeira assinatura (customerId não cadastrado)', async () => {
      const eqSingleMock = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      const eqMock = vi.fn().mockReturnValue({ single: eqSingleMock })
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
      const eqUpdateTenant = vi.fn().mockResolvedValue({ data: null, error: null })
      const eqUpdateId = vi.fn().mockReturnValue({ eq: eqUpdateTenant })
      const updateMock = vi.fn().mockReturnValue({ eq: eqUpdateId })

      mockFrom
        .mockReturnValueOnce({ select: selectMock })  // lookup by customerId → not found
        .mockReturnValueOnce({ update: updateMock })  // update using metadata.tenant_id

      const req = makeRequest({
        event: 'subscription.completed',
        data: {
          id: 'sub_new',
          customerId: 'cus_new',
          metadata: { tenant_id: 'tenant-first-time' },
          items: [{ productId: 'prod_pro' }],
        },
      })
      const res = await POST(req)

      expect(res.status).toBe(200)
      expect(eqUpdateId).toHaveBeenCalledWith('id', 'tenant-first-time')
    })

    it('retorna 404 quando tenant não encontrado por nenhum método', async () => {
      const eqSingleMock = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      const eqMock = vi.fn().mockReturnValue({ single: eqSingleMock })
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
      mockFrom.mockReturnValue({ select: selectMock })

      const req = makeRequest({
        event: 'subscription.completed',
        data: {
          id: 'sub_orphan',
          customerId: 'cus_unknown',
          metadata: {},
          items: [{ productId: 'prod_basic' }],
        },
      })
      const res = await POST(req)
      expect(res.status).toBe(404)
    })

    it('retorna 500 quando Supabase falha (força retry do AbacatePay)', async () => {
      const eqSingleMock = vi.fn().mockResolvedValue({ data: { id: 'tenant-ok' }, error: null })
      const eqMock = vi.fn().mockReturnValue({ single: eqSingleMock })
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
      const eqUpdateMock = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
      const updateMock = vi.fn().mockReturnValue({ eq: eqUpdateMock })

      mockFrom
        .mockReturnValueOnce({ select: selectMock })
        .mockReturnValueOnce({ update: updateMock })

      const req = makeRequest({
        event: 'subscription.completed',
        data: {
          id: 'sub_err',
          customerId: 'cus_abc',
          metadata: { tenant_id: 'tenant-ok' },
          items: [{ productId: 'prod_basic' }],
        },
      })
      const res = await POST(req)
      expect(res.status).toBe(500)
    })
  })

  describe('subscription.renewed', () => {
    it('atualiza status para active', async () => {
      const eqMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const updateMock = vi.fn().mockReturnValue({ eq: eqMock })
      mockFrom.mockReturnValue({ update: updateMock })

      const req = makeRequest({
        event: 'subscription.renewed',
        data: { id: 'sub_123' },
      })
      const res = await POST(req)

      expect(res.status).toBe(200)
      expect(updateMock).toHaveBeenCalledWith({ status: 'active' })
      expect(eqMock).toHaveBeenCalledWith('abacate_subscription_id', 'sub_123')
    })

    it('retorna 500 quando Supabase falha', async () => {
      const eqMock = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
      const updateMock = vi.fn().mockReturnValue({ eq: eqMock })
      mockFrom.mockReturnValue({ update: updateMock })

      const req = makeRequest({
        event: 'subscription.renewed',
        data: { id: 'sub_123' },
      })
      const res = await POST(req)
      expect(res.status).toBe(500)
    })
  })

  describe('subscription.cancelled', () => {
    it('reverte para plano free', async () => {
      const eqMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const updateMock = vi.fn().mockReturnValue({ eq: eqMock })
      mockFrom.mockReturnValue({ update: updateMock })

      const req = makeRequest({
        event: 'subscription.cancelled',
        data: { id: 'sub_123' },
      })
      const res = await POST(req)

      expect(res.status).toBe(200)
      expect(updateMock).toHaveBeenCalledWith({
        plan: 'free',
        status: 'active',
        abacate_subscription_id: null,
      })
    })

    it('retorna 500 quando Supabase falha', async () => {
      const eqMock = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
      const updateMock = vi.fn().mockReturnValue({ eq: eqMock })
      mockFrom.mockReturnValue({ update: updateMock })

      const req = makeRequest({
        event: 'subscription.cancelled',
        data: { id: 'sub_123' },
      })
      const res = await POST(req)
      expect(res.status).toBe(500)
    })
  })

  it('retorna 200 para eventos desconhecidos (idempotência)', async () => {
    const req = makeRequest({ event: 'unknown.event', data: { id: 'x' } })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })
})
