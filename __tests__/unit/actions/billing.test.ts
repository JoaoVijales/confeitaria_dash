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

const mockCheckoutCreate = vi.hoisted(() => vi.fn())
const mockPortalCreate = vi.hoisted(() => vi.fn())
vi.mock('@/lib/stripe/client', () => ({
  stripe: {
    checkout: { sessions: { create: mockCheckoutCreate } },
    billingPortal: { sessions: { create: mockPortalCreate } },
  },
}))

import { createCheckoutSession, createBillingPortalSession } from '@/app/actions/billing'
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
              data: { id: 'tenant-1', stripe_customer_id: null },
              error: null,
            }),
          }),
        }),
      })
      mockCheckoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/session/123' })

      await createCheckoutSession('price_basic_monthly')

      expect(mockCheckoutCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'subscription',
          line_items: [{ price: 'price_basic_monthly', quantity: 1 }],
        })
      )
      expect(redirect).toHaveBeenCalledWith('https://checkout.stripe.com/session/123')
    })

    it('reutiliza stripe_customer_id existente', async () => {
      mockGetFirebaseSession.mockResolvedValue({ uid: 'user-123' })
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'tenant-1', stripe_customer_id: 'cus_existing' },
              error: null,
            }),
          }),
        }),
      })
      mockCheckoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/session/456' })

      await createCheckoutSession('price_pro_monthly')

      expect(mockCheckoutCreate).toHaveBeenCalledWith(
        expect.objectContaining({ customer: 'cus_existing' })
      )
    })

    it('lança erro quando usuário não autenticado', async () => {
      mockGetFirebaseSession.mockResolvedValue(null)

      await expect(createCheckoutSession('price_basic_monthly')).rejects.toThrow(
        'Usuário não autenticado'
      )
      expect(mockCheckoutCreate).not.toHaveBeenCalled()
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

      await expect(createCheckoutSession('price_basic_monthly')).rejects.toThrow(
        'Tenant não encontrado'
      )
    })
  })

  describe('createBillingPortalSession', () => {
    it('redireciona para portal do cliente', async () => {
      mockGetFirebaseSession.mockResolvedValue({ uid: 'user-123' })
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { stripe_customer_id: 'cus_existing' },
              error: null,
            }),
          }),
        }),
      })
      mockPortalCreate.mockResolvedValue({ url: 'https://billing.stripe.com/portal/123' })

      await createBillingPortalSession()

      expect(mockPortalCreate).toHaveBeenCalledWith(
        expect.objectContaining({ customer: 'cus_existing' })
      )
      expect(redirect).toHaveBeenCalledWith('https://billing.stripe.com/portal/123')
    })

    it('lança erro quando usuário não autenticado', async () => {
      mockGetFirebaseSession.mockResolvedValue(null)

      await expect(createBillingPortalSession()).rejects.toThrow('Usuário não autenticado')
    })

    it('lança erro quando não há stripe_customer_id', async () => {
      mockGetFirebaseSession.mockResolvedValue({ uid: 'user-123' })
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { stripe_customer_id: null },
              error: null,
            }),
          }),
        }),
      })

      await expect(createBillingPortalSession()).rejects.toThrow('Sem assinatura ativa')
    })
  })
})
