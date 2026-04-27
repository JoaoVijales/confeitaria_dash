import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import BillingPage from '@/app/dashboard/billing/page'
import { usePlan } from '@/hooks/usePlan'

vi.mock('@/hooks/usePlan', () => ({
  usePlan: vi.fn(),
}))

vi.mock('@/app/actions/billing', () => ({
  createCheckoutSession: vi.fn(),
  cancelSubscription: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => ({ get: vi.fn(() => null) })),
}))

const freePlanData = {
  plan: 'free' as const,
  tenantName: 'Confeitaria da Maria',
  limits: { maxProducts: 30, maxOrdersPerMonth: 50, name: 'Gratuito' },
}

const basicPlanData = {
  plan: 'basic' as const,
  tenantName: 'Confeitaria da Maria',
  limits: { maxProducts: 200, maxOrdersPerMonth: Infinity, name: 'Básico' },
}

describe('BillingPage', () => {
  it('exibe os 3 planos disponíveis', () => {
    ;(usePlan as ReturnType<typeof vi.fn>).mockReturnValue({
      data: freePlanData,
      isLoading: false,
    })

    render(<BillingPage />)

    expect(screen.getByText('R$ 0')).toBeInTheDocument()
    expect(screen.getByText('R$ 49')).toBeInTheDocument()
    expect(screen.getByText('R$ 99')).toBeInTheDocument()
  })

  it('marca o plano atual com badge "Plano atual"', () => {
    ;(usePlan as ReturnType<typeof vi.fn>).mockReturnValue({
      data: basicPlanData,
      isLoading: false,
    })

    render(<BillingPage />)

    expect(screen.getAllByText('Plano atual').length).toBeGreaterThan(0)
  })

  it('exibe skeleton durante carregamento', () => {
    ;(usePlan as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
    })

    render(<BillingPage />)

    expect(screen.getByText('Plano & Billing')).toBeInTheDocument()
  })
})
