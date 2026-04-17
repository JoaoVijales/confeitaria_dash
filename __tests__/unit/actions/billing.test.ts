import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

const mockGetFirebaseSession = vi.hoisted(() => vi.fn())
vi.mock('@/lib/firebase/session', () => ({
  getFirebaseSession: mockGetFirebaseSession,
}))

const mockFrom = vi.hoisted(() => vi.fn())
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
}))

const mockSubscriptionsCreate = vi.hoisted(() => vi.fn())
const mockSubscriptionsCancel = vi.hoisted(() => vi.fn())
vi.mock('@/lib/abacatepay/client', () => ({
  abacatepay: {
    subscriptions: {
      create: mockSubscriptionsCreate,
      cancel: mockSubscriptionsCancel,
    },
  },
}))

import { createCheckoutSession, cancelSubscription } from '@/app/actions/billing'
import { redirect } from 'next/navigation'

describe('billing actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createCheckoutSession', () => {
    it('redireciona para URL do checkout quando bem-sucedido', async () => {
      mockGetFirebaseSession.mockResolvedValue({ uid: 'user-123' })
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'tenant-1', abacate_customer_id: null },
              error: null,
            }),
          }),
        }),
      })
      mockSubscriptionsCreate.mockResolvedValue({ id: 'sub_1', url: 'https://checkout.abacatepay.com/session/123' })

      process.env.ABACATEPAY_PRODUCT_ID_BASIC = 'prod_basic'
      await createCheckoutSession('basic')

      expect(mockSubscriptionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [{ productId: 'prod_basic', quantity: 1 }],
          metadata: { tenant_id: 'tenant-1' },
        })
      )
      expect(redirect).toHaveBeenCalledWith('https://checkout.abacatepay.com/session/123')
    })

    it('reutiliza abacate_customer_id existente', async () => {
      mockGetFirebaseSession.mockResolvedValue({ uid: 'user-123' })
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'tenant-1', abacate_customer_id: 'cus_existing' },
              error: null,
            }),
          }),
        }),
      })
      mockSubscriptionsCreate.mockResolvedValue({ id: 'sub_2', url: 'https://checkout.abacatepay.com/session/456' })

      process.env.ABACATEPAY_PRODUCT_ID_PRO = 'prod_pro'
      await createCheckoutSession('pro')

      expect(mockSubscriptionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({ customerId: 'cus_existing' })
      )
    })

    it('lança erro quando usuário não autenticado', async () => {
      mockGetFirebaseSession.mockResolvedValue(null)

      await expect(createCheckoutSession('basic')).rejects.toThrow('Usuário não autenticado')
      expect(mockSubscriptionsCreate).not.toHaveBeenCalled()
    })

    it('lança erro quando tenant não encontrado', async () => {
      mockGetFirebaseSession.mockResolvedValue({ uid: 'user-123' })
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
          }),
        }),
      })

      await expect(createCheckoutSession('basic')).rejects.toThrow('Tenant não encontrado')
    })

    it('lança erro quando planKey é inválido', async () => {
      mockGetFirebaseSession.mockResolvedValue({ uid: 'user-123' })
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'tenant-1', abacate_customer_id: null },
              error: null,
            }),
          }),
        }),
      })

      process.env.ABACATEPAY_PRODUCT_ID_BASIC = ''
      await expect(createCheckoutSession('basic')).rejects.toThrow('Plano inválido')
    })
  })

  describe('cancelSubscription', () => {
    it('cancela assinatura ativa', async () => {
      mockGetFirebaseSession.mockResolvedValue({ uid: 'user-123' })
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { abacate_subscription_id: 'sub_abc123' },
              error: null,
            }),
          }),
        }),
      })
      mockSubscriptionsCancel.mockResolvedValue(undefined)

      await cancelSubscription()

      expect(mockSubscriptionsCancel).toHaveBeenCalledWith('sub_abc123')
    })

    it('lança erro quando usuário não autenticado', async () => {
      mockGetFirebaseSession.mockResolvedValue(null)

      await expect(cancelSubscription()).rejects.toThrow('Usuário não autenticado')
    })

    it('lança erro quando não há assinatura ativa', async () => {
      mockGetFirebaseSession.mockResolvedValue({ uid: 'user-123' })
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { abacate_subscription_id: null },
              error: null,
            }),
          }),
        }),
      })

      await expect(cancelSubscription()).rejects.toThrow('Sem assinatura ativa')
    })
  })
})
