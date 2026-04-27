import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const { mockGte, mockFrom } = vi.hoisted(() => {
  const mockGte = vi.fn()
  const mockSelect = vi.fn(() => ({ gte: mockGte }))
  const mockFrom = vi.fn(() => ({ select: mockSelect }))
  return { mockGte, mockFrom }
})

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
}))

import { useSalesChart } from '@/hooks/useSalesChart'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return QueryClientProvider({ client: queryClient, children })
  }
}

describe('useSalesChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna isLoading true inicialmente', () => {
    mockGte.mockImplementation(() => new Promise(() => {}))
    const { result } = renderHook(() => useSalesChart(), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(true)
  })

  it('agrupa vendas por dia da semana e retorna chartData', async () => {
    const today = new Date().toISOString()

    mockGte.mockResolvedValueOnce({
      data: [
        { created_at: today, total: 100 },
        { created_at: today, total: 50 },
      ],
      error: null,
    })

    const { result } = renderHook(() => useSalesChart(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const data = result.current.data!
    expect(data).toHaveLength(1)
    expect(data[0].vendas).toBe(150)
    expect(typeof data[0].name).toBe('string')
  })

  it('retorna array vazio quando nao ha pedidos', async () => {
    mockGte.mockResolvedValueOnce({ data: [], error: null })

    const { result } = renderHook(() => useSalesChart(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
  })

  it('propaga erro do Supabase', async () => {
    mockGte.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } })

    const { result } = renderHook(() => useSalesChart(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('consulta a tabela orders', async () => {
    mockGte.mockResolvedValueOnce({ data: [], error: null })

    const { result } = renderHook(() => useSalesChart(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockFrom).toHaveBeenCalledWith('orders')
  })
})
