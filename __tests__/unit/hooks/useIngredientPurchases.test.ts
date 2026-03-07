import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const { mockOrder, mockEq, mockSelect, mockFrom } = vi.hoisted(() => {
  const mockOrder = vi.fn()
  const mockEq = vi.fn(() => ({ order: mockOrder }))
  const mockSelect = vi.fn(() => ({ eq: mockEq, order: mockOrder }))
  const mockFrom = vi.fn(() => ({ select: mockSelect }))
  return { mockOrder, mockEq, mockSelect, mockFrom }
})

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
}))

import { useIngredientPurchases } from '@/hooks/useIngredientPurchases'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return QueryClientProvider({ client: queryClient, children })
  }
}

const mockPurchases = [
  { id: 1, ingredient_id: 1, quantity: 10, unit_cost: 5.5, total_cost: 55, purchased_at: '2026-03-07', supplier: 'Fornecedor X' },
  { id: 2, ingredient_id: 1, quantity: 20, unit_cost: 5.0, total_cost: 100, purchased_at: '2026-02-15', supplier: null },
]

describe('useIngredientPurchases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('busca compras de um ingrediente especifico', async () => {
    mockOrder.mockResolvedValueOnce({ data: mockPurchases, error: null })

    const { result } = renderHook(() => useIngredientPurchases(1), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockPurchases)
    expect(mockFrom).toHaveBeenCalledWith('ingredient_purchases')
    expect(mockEq).toHaveBeenCalledWith('ingredient_id', 1)
  })

  it('busca todas as compras quando nenhum id passado', async () => {
    mockOrder.mockResolvedValueOnce({ data: mockPurchases, error: null })

    const { result } = renderHook(() => useIngredientPurchases(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockPurchases)
    expect(mockEq).not.toHaveBeenCalled()
  })

  it('trata erro do supabase', async () => {
    mockOrder.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } })

    const { result } = renderHook(() => useIngredientPurchases(1), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual({ message: 'DB error' })
  })
})
