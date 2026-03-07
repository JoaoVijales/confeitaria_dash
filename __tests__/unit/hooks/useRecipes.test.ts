import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const { mockSelect, mockFrom } = vi.hoisted(() => {
  const mockSelect = vi.fn()
  const mockFrom = vi.fn(() => ({ select: mockSelect }))
  return { mockSelect, mockFrom }
})

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
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
    products: { id: 'p1', name: 'Bolo', price: 50, cost: 20 },
    recipe_ingredients: [
      { quantity: 2, ingredients: { id: 'i1', name: 'Farinha', unit: 'kg', unit_cost: 5 } },
    ],
  },
]

describe('useRecipes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch recipes successfully', async () => {
    mockSelect.mockResolvedValueOnce({ data: mockRecipes, error: null })

    const { result } = renderHook(() => useRecipes(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockRecipes)
    expect(mockFrom).toHaveBeenCalledWith('recipes')
  })

  it('should handle error from supabase', async () => {
    mockSelect.mockResolvedValueOnce({ data: null, error: { message: 'Recipe error' } })

    const { result } = renderHook(() => useRecipes(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual({ message: 'Recipe error' })
  })
})
