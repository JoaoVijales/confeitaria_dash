import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

const mockGetTenantPlan = vi.hoisted(() => vi.fn())

vi.mock('@/app/actions/billing', () => ({
  getTenantPlan: mockGetTenantPlan,
}))

import { usePlan } from '@/hooks/usePlan'

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('usePlan', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna plano básico com limites corretos', async () => {
    mockGetTenantPlan.mockResolvedValue({ plan: 'basic', name: 'Confeitaria da Maria', status: 'active' })

    const { result } = renderHook(() => usePlan(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.plan).toBe('basic')
    expect(result.current.data?.tenantName).toBe('Confeitaria da Maria')
    expect(result.current.data?.status).toBe('active')
    expect(result.current.data?.limits.maxProducts).toBe(10)
    expect(result.current.data?.limits.maxOrdersPerMonth).toBe(Infinity)
  })

  it('retorna plano pro com limites corretos', async () => {
    mockGetTenantPlan.mockResolvedValue({ plan: 'pro', name: 'Confeitaria Pro', status: 'active' })

    const { result } = renderHook(() => usePlan(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.plan).toBe('pro')
    expect(result.current.data?.limits.maxProducts).toBe(50)
  })

  it('retorna plano max com produtos ilimitados', async () => {
    mockGetTenantPlan.mockResolvedValue({ plan: 'max', name: 'Mega Confeitaria', status: 'active' })

    const { result } = renderHook(() => usePlan(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.plan).toBe('max')
    expect(result.current.data?.limits.maxProducts).toBe(Infinity)
    expect(result.current.data?.limits.maxOrdersPerMonth).toBe(Infinity)
  })

  it('retorna status cancelled para tenant bloqueado', async () => {
    mockGetTenantPlan.mockResolvedValue({ plan: 'free', name: '', status: 'cancelled' })

    const { result } = renderHook(() => usePlan(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.plan).toBe('free')
    expect(result.current.data?.status).toBe('cancelled')
    expect(result.current.data?.limits.maxProducts).toBe(0)
  })
})
