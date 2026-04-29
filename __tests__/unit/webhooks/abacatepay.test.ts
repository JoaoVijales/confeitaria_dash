import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.hoisted(() => vi.fn())
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
}))

const mockLogError = vi.hoisted(() => vi.fn())
const mockLogWarn = vi.hoisted(() => vi.fn())
const mockLogInfo = vi.hoisted(() => vi.fn())
vi.mock('@/lib/logger', () => ({
  logError: mockLogError,
  logWarn: mockLogWarn,
  logInfo: mockLogInfo,
}))

import { POST } from '@/app/api/webhooks/abacatepay/route'
import { NextRequest } from 'next/server'

const WEBHOOK_SECRET = 'test-secret-123'

function makeRequest(body: object, secret = WEBHOOK_SECRET): NextRequest {
  const bodyStr = JSON.stringify(body)
  return new NextRequest(
    `http://localhost/api/webhooks/abacatepay?webhookSecret=${secret}`,
    { method: 'POST', body: bodyStr },
  )
}

// AbacatePay v2 payload helpers
function makeCompletedPayload(override: {
  subscriptionId?: string
  customerId?: string
  metadataTenantId?: string | null
  itemId?: string
}) {
  return {
    event: 'subscription.completed',
    data: {
      subscription: { id: override.subscriptionId ?? 'sub_123' },
      customer: { id: override.customerId ?? 'cus_abc' },
      checkout: {
        metadata: override.metadataTenantId != null
          ? { tenant_id: override.metadataTenantId }
          : {},
        items: [{ id: override.itemId ?? 'prod_basic' }],
      },
    },
  }
}

function makeSubscriptionPayload(event: 'subscription.renewed' | 'subscription.cancelled', subscriptionId = 'sub_123') {
  return { event, data: { subscription: { id: subscriptionId } } }
}

function makeSelectTenantMock(result: { data: { id: string } | null; error: unknown }) {
  const singleMock = vi.fn().mockResolvedValue(result)
  const eqMock = vi.fn().mockReturnValue({ single: singleMock })
  const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
  return { selectMock, eqMock, singleMock }
}

function makeUpdateMock(result: { data: Array<{ id: string }> | null; error: unknown }) {
  const selectAfterUpdate = vi.fn().mockResolvedValue(result)
  const eqMock = vi.fn().mockReturnValue({ select: selectAfterUpdate })
  const updateMock = vi.fn().mockReturnValue({ eq: eqMock })
  return { updateMock, eqMock, selectAfterUpdate }
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.ABACATEPAY_WEBHOOK_SECRET = WEBHOOK_SECRET
  process.env.ABACATEPAY_PRODUCT_ID_BASIC = 'prod_basic'
  process.env.ABACATEPAY_PRODUCT_ID_PRO = 'prod_pro'
})

describe('POST /api/webhooks/abacatepay', () => {
  describe('verificação de secret', () => {
    it('retorna 400 com webhookSecret inválido', async () => {
      const req = makeRequest({ event: 'subscription.completed', data: {} }, 'wrong-secret')
      const res = await POST(req)
      expect(res.status).toBe(400)
    })

    it('retorna 400 sem webhookSecret', async () => {
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
      const { selectMock } = makeSelectTenantMock({ data: { id: 'tenant-from-db' }, error: null })
      const { updateMock, eqMock } = makeUpdateMock({ data: [{ id: 'tenant-from-db' }], error: null })

      mockFrom
        .mockReturnValueOnce({ select: selectMock })
        .mockReturnValueOnce({ update: updateMock })

      const req = makeRequest(makeCompletedPayload({
        customerId: 'cus_abc',
        metadataTenantId: 'DIFFERENT-TENANT-FROM-ATTACKER',
        itemId: 'prod_basic',
      }))
      const res = await POST(req)

      expect(res.status).toBe(200)
      expect(eqMock).toHaveBeenCalledWith('id', 'tenant-from-db')
    })

    it('usa metadata.tenant_id como fallback na primeira assinatura (customerId não cadastrado)', async () => {
      const { selectMock } = makeSelectTenantMock({ data: null, error: { code: 'PGRST116' } })
      const { updateMock, eqMock } = makeUpdateMock({ data: [{ id: 'tenant-first-time' }], error: null })

      mockFrom
        .mockReturnValueOnce({ select: selectMock })
        .mockReturnValueOnce({ update: updateMock })

      const req = makeRequest(makeCompletedPayload({
        customerId: 'cus_new',
        metadataTenantId: 'tenant-first-time',
        itemId: 'prod_pro',
      }))
      const res = await POST(req)

      expect(res.status).toBe(200)
      expect(eqMock).toHaveBeenCalledWith('id', 'tenant-first-time')
    })

    it('lê o campo `id` dos items (não `productId`) para resolver o plano', async () => {
      const { selectMock } = makeSelectTenantMock({ data: { id: 'tenant-ok' }, error: null })
      const { updateMock, updateMock: um } = makeUpdateMock({ data: [{ id: 'tenant-ok' }], error: null })

      mockFrom
        .mockReturnValueOnce({ select: selectMock })
        .mockReturnValueOnce({ update: updateMock })

      const req = makeRequest(makeCompletedPayload({
        metadataTenantId: 'tenant-ok',
        itemId: 'prod_basic',
      }))
      await POST(req)

      expect(um).toHaveBeenCalledWith(expect.objectContaining({ plan: 'basic' }))
    })

    it('retorna 200 (não 404) quando tenant não encontrado — evita retentativas infinitas', async () => {
      const { selectMock } = makeSelectTenantMock({ data: null, error: { code: 'PGRST116' } })
      mockFrom.mockReturnValue({ select: selectMock })

      const req = makeRequest(makeCompletedPayload({
        customerId: 'cus_unknown',
        metadataTenantId: null,
        itemId: 'prod_basic',
      }))
      const res = await POST(req)
      expect(res.status).toBe(200)
      expect(mockLogError).toHaveBeenCalledWith(
        expect.stringContaining('tenant_id ausente'),
        null,
        expect.objectContaining({ service: 'abacatepay' }),
      )
    })

    it('retorna 500 quando Supabase falha (força retry do AbacatePay)', async () => {
      const { selectMock } = makeSelectTenantMock({ data: { id: 'tenant-ok' }, error: null })
      const { updateMock } = makeUpdateMock({ data: null, error: { message: 'DB error' } })

      mockFrom
        .mockReturnValueOnce({ select: selectMock })
        .mockReturnValueOnce({ update: updateMock })

      const req = makeRequest(makeCompletedPayload({ metadataTenantId: 'tenant-ok' }))
      const res = await POST(req)

      expect(res.status).toBe(500)
      expect(mockLogError).toHaveBeenCalledWith(
        expect.stringContaining('subscription.completed'),
        expect.anything(),
        expect.objectContaining({ service: 'abacatepay', tenantId: 'tenant-ok' }),
      )
    })

    it('loga logWarn quando productId desconhecido resolve para plano free', async () => {
      const { selectMock } = makeSelectTenantMock({ data: { id: 'tenant-ok' }, error: null })
      const { updateMock } = makeUpdateMock({ data: [{ id: 'tenant-ok' }], error: null })

      mockFrom
        .mockReturnValueOnce({ select: selectMock })
        .mockReturnValueOnce({ update: updateMock })

      const req = makeRequest(makeCompletedPayload({
        metadataTenantId: 'tenant-ok',
        itemId: 'prod_DESCONHECIDO',
      }))
      const res = await POST(req)

      expect(res.status).toBe(200)
      expect(mockLogWarn).toHaveBeenCalledWith(
        expect.stringContaining('productId desconhecido'),
        expect.objectContaining({
          service: 'abacatepay',
          tenantId: 'tenant-ok',
          productId: 'prod_DESCONHECIDO',
        }),
      )
    })

    it('loga logError e retorna 200 quando 0 linhas são atualizadas (tenant ausente no banco)', async () => {
      const { selectMock } = makeSelectTenantMock({ data: { id: 'tenant-ok' }, error: null })
      const { updateMock } = makeUpdateMock({ data: [], error: null })

      mockFrom
        .mockReturnValueOnce({ select: selectMock })
        .mockReturnValueOnce({ update: updateMock })

      const req = makeRequest(makeCompletedPayload({ metadataTenantId: 'tenant-ok' }))
      const res = await POST(req)

      expect(res.status).toBe(200)
      expect(mockLogError).toHaveBeenCalledWith(
        expect.stringContaining('nenhuma linha atualizada'),
        null,
        expect.objectContaining({ service: 'abacatepay', tenantId: 'tenant-ok' }),
      )
    })

    it('loga logInfo com tenantId e plano após atualização bem-sucedida', async () => {
      const { selectMock } = makeSelectTenantMock({ data: { id: 'tenant-ok' }, error: null })
      const { updateMock } = makeUpdateMock({ data: [{ id: 'tenant-ok' }], error: null })

      mockFrom
        .mockReturnValueOnce({ select: selectMock })
        .mockReturnValueOnce({ update: updateMock })

      const req = makeRequest(makeCompletedPayload({
        subscriptionId: 'sub_123',
        metadataTenantId: 'tenant-ok',
        itemId: 'prod_pro',
      }))
      await POST(req)

      expect(mockLogInfo).toHaveBeenCalledWith(
        expect.stringContaining('plano atualizado com sucesso'),
        expect.objectContaining({
          service: 'abacatepay',
          tenantId: 'tenant-ok',
          plan: 'pro',
          subscriptionId: 'sub_123',
        }),
      )
    })
  })

  describe('subscription.renewed', () => {
    it('atualiza status para active', async () => {
      const { updateMock, eqMock } = makeUpdateMock({ data: [{ id: 'tenant-ok' }], error: null })
      mockFrom.mockReturnValue({ update: updateMock })

      const req = makeRequest(makeSubscriptionPayload('subscription.renewed', 'sub_123'))
      const res = await POST(req)

      expect(res.status).toBe(200)
      expect(updateMock).toHaveBeenCalledWith({ status: 'active' })
      expect(eqMock).toHaveBeenCalledWith('abacate_subscription_id', 'sub_123')
      expect(mockLogInfo).toHaveBeenCalledWith(
        expect.stringContaining('renovada com sucesso'),
        expect.objectContaining({ subscriptionId: 'sub_123' }),
      )
    })

    it('loga logWarn quando subscription_id não encontrado', async () => {
      const { updateMock } = makeUpdateMock({ data: [], error: null })
      mockFrom.mockReturnValue({ update: updateMock })

      const req = makeRequest(makeSubscriptionPayload('subscription.renewed', 'sub_fantasma'))
      const res = await POST(req)

      expect(res.status).toBe(200)
      expect(mockLogWarn).toHaveBeenCalledWith(
        expect.stringContaining('subscription_id não encontrado'),
        expect.objectContaining({ subscriptionId: 'sub_fantasma' }),
      )
    })

    it('retorna 500 quando Supabase falha', async () => {
      const { updateMock } = makeUpdateMock({ data: null, error: { message: 'DB error' } })
      mockFrom.mockReturnValue({ update: updateMock })

      const req = makeRequest(makeSubscriptionPayload('subscription.renewed'))
      const res = await POST(req)
      expect(res.status).toBe(500)
    })
  })

  describe('subscription.cancelled', () => {
    it('reverte para plano free', async () => {
      const { updateMock, eqMock } = makeUpdateMock({ data: [{ id: 'tenant-ok' }], error: null })
      mockFrom.mockReturnValue({ update: updateMock })

      const req = makeRequest(makeSubscriptionPayload('subscription.cancelled', 'sub_123'))
      const res = await POST(req)

      expect(res.status).toBe(200)
      expect(updateMock).toHaveBeenCalledWith({
        plan: 'free',
        status: 'active',
        abacate_subscription_id: null,
      })
      expect(eqMock).toHaveBeenCalledWith('abacate_subscription_id', 'sub_123')
      expect(mockLogInfo).toHaveBeenCalledWith(
        expect.stringContaining('cancelada com sucesso'),
        expect.objectContaining({ subscriptionId: 'sub_123' }),
      )
    })

    it('loga logWarn quando subscription_id não encontrado no cancelamento', async () => {
      const { updateMock } = makeUpdateMock({ data: [], error: null })
      mockFrom.mockReturnValue({ update: updateMock })

      const req = makeRequest(makeSubscriptionPayload('subscription.cancelled', 'sub_fantasma'))
      const res = await POST(req)

      expect(res.status).toBe(200)
      expect(mockLogWarn).toHaveBeenCalledWith(
        expect.stringContaining('subscription_id não encontrado'),
        expect.objectContaining({ subscriptionId: 'sub_fantasma' }),
      )
    })

    it('retorna 500 quando Supabase falha', async () => {
      const { updateMock } = makeUpdateMock({ data: null, error: { message: 'DB error' } })
      mockFrom.mockReturnValue({ update: updateMock })

      const req = makeRequest(makeSubscriptionPayload('subscription.cancelled'))
      const res = await POST(req)
      expect(res.status).toBe(500)
    })
  })

  it('retorna 200 para eventos desconhecidos (idempotência)', async () => {
    const req = makeRequest({ event: 'unknown.event', data: { subscription: { id: 'x' } } })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })
})
