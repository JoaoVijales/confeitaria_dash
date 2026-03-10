import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

const mockSingle = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: mockSingle,
      }),
    }),
  })),
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

  it('retorna plano gratuito quando tenant tem plano free', async () => {
    mockSingle.mockResolvedValue({ data: { plan: 'free', name: 'Minha Confeitaria' }, error: null })

    const { result } = renderHook(() => usePlan(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.plan).toBe('free')
    expect(result.current.data?.tenantName).toBe('Minha Confeitaria')
    expect(result.current.data?.limits.maxProducts).toBe(30)
  })

  it('retorna plano básico com limites corretos', async () => {
    mockSingle.mockResolvedValue({ data: { plan: 'basic', name: 'Confeitaria Pro' }, error: null })

    const { result } = renderHook(() => usePlan(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.plan).toBe('basic')
    expect(result.current.data?.limits.maxProducts).toBe(200)
    expect(result.current.data?.limits.maxOrdersPerMonth).toBe(Infinity)
  })

  it('usa plano free como fallback quando dado é null', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })

    const { result } = renderHook(() => usePlan(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.plan).toBe('free')
  })
})
