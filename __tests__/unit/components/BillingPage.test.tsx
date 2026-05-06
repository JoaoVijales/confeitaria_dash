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
  syncPlanCookie: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => ({ get: vi.fn(() => null) })),
}))

const basicPlanData = {
  plan: 'basic' as const,
  tenantName: 'Confeitaria da Maria',
  status: 'active',
  limits: { maxProducts: 10, maxOrdersPerMonth: Infinity, name: 'Básico' },
}

const blockedPlanData = {
  plan: 'free' as const,
  tenantName: 'Confeitaria da Maria',
  status: 'cancelled',
  limits: { maxProducts: 0, maxOrdersPerMonth: 0, name: 'Sem plano ativo' },
}

describe('BillingPage', () => {
  it('exibe os 3 planos disponíveis com os novos preços', () => {
    ;(usePlan as ReturnType<typeof vi.fn>).mockReturnValue({
      data: blockedPlanData,
      isLoading: false,
    })

    render(<BillingPage />)

    expect(screen.getByText('R$ 9,90')).toBeInTheDocument()
    expect(screen.getByText('R$ 49,90')).toBeInTheDocument()
    expect(screen.getByText('R$ 99,90')).toBeInTheDocument()
  })

  it('exibe os nomes corretos dos planos (Básico, Pro, Max)', () => {
    ;(usePlan as ReturnType<typeof vi.fn>).mockReturnValue({
      data: blockedPlanData,
      isLoading: false,
    })

    render(<BillingPage />)

    expect(screen.getByText('Básico')).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('Max')).toBeInTheDocument()
  })

  it('marca o plano atual com badge "Plano atual" quando ativo', () => {
    ;(usePlan as ReturnType<typeof vi.fn>).mockReturnValue({
      data: basicPlanData,
      isLoading: false,
    })

    render(<BillingPage />)

    expect(screen.getAllByText('Plano atual').length).toBeGreaterThan(0)
  })

  it('não mostra badge "Plano atual" para tenant bloqueado', () => {
    ;(usePlan as ReturnType<typeof vi.fn>).mockReturnValue({
      data: blockedPlanData,
      isLoading: false,
    })

    render(<BillingPage />)

    expect(screen.queryByText('Plano atual')).not.toBeInTheDocument()
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
