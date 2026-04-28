import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const mockGetIngredientPurchases = vi.hoisted(() => vi.fn())
vi.mock('@/app/actions/ingredient-purchases', () => ({
  getIngredientPurchases: mockGetIngredientPurchases,
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

  it('busca compras de um ingrediente específico', async () => {
    mockGetIngredientPurchases.mockResolvedValueOnce(mockPurchases)
    const { result } = renderHook(() => useIngredientPurchases(1), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockPurchases)
    expect(mockGetIngredientPurchases).toHaveBeenCalledWith(1)
  })

  it('busca todas as compras quando nenhum id passado', async () => {
    mockGetIngredientPurchases.mockResolvedValueOnce(mockPurchases)
    const { result } = renderHook(() => useIngredientPurchases(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockPurchases)
    expect(mockGetIngredientPurchases).toHaveBeenCalledWith(undefined)
  })

  it('propaga erro da server action', async () => {
    mockGetIngredientPurchases.mockRejectedValueOnce(new Error('DB error'))
    const { result } = renderHook(() => useIngredientPurchases(1), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
