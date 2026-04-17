import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const mockGetIngredients = vi.hoisted(() => vi.fn())

vi.mock('@/app/actions/ingredients', () => ({
  getIngredients: mockGetIngredients,
  createIngredient: vi.fn(),
  updateIngredient: vi.fn(),
  deleteIngredient: vi.fn(),
}))

import { useIngredients } from '@/hooks/useIngredients'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return QueryClientProvider({ client: queryClient, children })
  }
}

const mockIngredients = [
  { id: 1, name: 'Farinha', unit: 'kg', unit_cost: 5.0, current_stock: 50, min_stock: 10, category: 'Secos', tenant_id: 't1' },
  { id: 2, name: 'Açúcar', unit: 'kg', unit_cost: 4.0, current_stock: 30, min_stock: 5, category: 'Secos', tenant_id: 't1' },
]

describe('useIngredients', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna lista de ingredientes da server action', async () => {
    mockGetIngredients.mockResolvedValueOnce(mockIngredients)

    const { result } = renderHook(() => useIngredients(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockIngredients)
  })

  it('propaga erro da server action', async () => {
    mockGetIngredients.mockRejectedValueOnce(new Error('DB error'))

    const { result } = renderHook(() => useIngredients(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect((result.current.error as Error).message).toBe('DB error')
  })
})
