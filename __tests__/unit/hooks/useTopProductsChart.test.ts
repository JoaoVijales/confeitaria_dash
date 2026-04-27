import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const { mockLimit, mockFrom } = vi.hoisted(() => {
  const mockLimit = vi.fn()
  const mockSelect = vi.fn(() => ({ limit: mockLimit }))
  const mockFrom = vi.fn(() => ({ select: mockSelect }))
  return { mockLimit, mockFrom }
})

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
}))

import { useTopProductsChart } from '@/hooks/useTopProductsChart'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return QueryClientProvider({ client: queryClient, children })
  }
}

const mockItems = [
  { quantity: 10, products: [{ name: 'Bolo de Chocolate' }] },
  { quantity: 5, products: [{ name: 'Bolo de Chocolate' }] },
  { quantity: 8, products: [{ name: 'Brigadeiro' }] },
  { quantity: 3, products: [{ name: 'Torta de Limão' }] },
  { quantity: 7, products: [{ name: 'Cupcake' }] },
  { quantity: 2, products: [{ name: 'Cookie' }] },
]

describe('useTopProductsChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna isLoading true inicialmente', () => {
    mockLimit.mockImplementation(() => new Promise(() => {}))
    const { result } = renderHook(() => useTopProductsChart(), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(true)
  })

  it('agrega quantidades por produto e retorna top 5', async () => {
    mockLimit.mockResolvedValueOnce({ data: mockItems, error: null })

    const { result } = renderHook(() => useTopProductsChart(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const data = result.current.data!
    expect(data).toHaveLength(5)
    expect(data[0].name).toBe('Bolo de Chocolate')
    expect(data[0].vendidos).toBe(15)
  })

  it('ordena produtos do mais vendido ao menos vendido', async () => {
    mockLimit.mockResolvedValueOnce({ data: mockItems, error: null })

    const { result } = renderHook(() => useTopProductsChart(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const data = result.current.data!
    for (let i = 0; i < data.length - 1; i++) {
      expect(data[i].vendidos).toBeGreaterThanOrEqual(data[i + 1].vendidos)
    }
  })

  it('retorna array vazio quando nao ha itens', async () => {
    mockLimit.mockResolvedValueOnce({ data: [], error: null })

    const { result } = renderHook(() => useTopProductsChart(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
  })

  it('ignora itens sem produto associado', async () => {
    mockLimit.mockResolvedValueOnce({
      data: [
        { quantity: 5, products: [] },
        { quantity: 3, products: [{ name: 'Bolo' }] },
      ],
      error: null,
    })

    const { result } = renderHook(() => useTopProductsChart(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data![0].name).toBe('Bolo')
  })

  it('propaga erro do Supabase', async () => {
    mockLimit.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } })

    const { result } = renderHook(() => useTopProductsChart(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
