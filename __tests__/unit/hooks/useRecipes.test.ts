import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const mockGetRecipes = vi.hoisted(() => vi.fn())

vi.mock('@/app/actions/recipes', () => ({
  getRecipes: mockGetRecipes,
  createRecipe: vi.fn(),
  updateRecipe: vi.fn(),
  deleteRecipe: vi.fn(),
}))

import { useRecipes } from '@/hooks/useRecipes'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return QueryClientProvider({ client: queryClient, children })
  }
}

const mockRecipes = [
  {
    id: '1',
    yield: 10,
    yield_unit: 'un',
    products: [{ id: 'p1', name: 'Bolo', price: 50, cost: 20 }],
    recipe_ingredients: [
      { quantity: 2, ingredients: [{ id: 1, name: 'Farinha', unit: 'kg', unit_cost: 5 }] },
    ],
    cost_per_yield_unit: 1,
  },
]

describe('useRecipes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna lista de receitas da server action', async () => {
    mockGetRecipes.mockResolvedValueOnce(mockRecipes)

    const { result } = renderHook(() => useRecipes(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockRecipes)
  })

  it('propaga erro da server action', async () => {
    mockGetRecipes.mockRejectedValueOnce(new Error('DB error'))

    const { result } = renderHook(() => useRecipes(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect((result.current.error as Error).message).toBe('DB error')
  })
})
