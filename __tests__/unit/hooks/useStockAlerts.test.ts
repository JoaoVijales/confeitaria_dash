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
  createClient: vi.fn(() => ({ from: mockFrom })),
}))

import { useStockAlerts } from '@/hooks/useStockAlerts'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return QueryClientProvider({ client: queryClient, children })
  }
}

// ing1: current=0.3, threshold via receita=0.8 → ALERTA
// ing2: current=1.0, threshold via receita=0.2 → OK
const mockIngredients = [
  { id: 'i1', name: 'Farinha', unit: 'kg', current_stock: 0.3, min_stock: 0.5 },
  { id: 'i2', name: 'Manteiga', unit: 'kg', current_stock: 1.0, min_stock: 0.2 },
]

// p1: stock=2, min=5 → ALERTA
// p2: stock=10, min=3 → OK
const mockProducts = [
  { id: 'p1', name: 'Bolo', stock: 2, min_stock: 5 },
  { id: 'p2', name: 'Torta', stock: 10, min_stock: 3 },
]

const mockRecipes = [
  {
    id: 'r1',
    recipe_ingredients: [
      { ingredient_id: 'i1', quantity: 0.5 },
      { ingredient_id: 'i2', quantity: 0.2 },
    ],
  },
  {
    id: 'r2',
    recipe_ingredients: [{ ingredient_id: 'i1', quantity: 0.3 }],
  },
]

describe('useStockAlerts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna ingredientes e produtos com estoque baixo', async () => {
    mockSelect
      .mockResolvedValueOnce({ data: mockIngredients, error: null })
      .mockResolvedValueOnce({ data: mockProducts, error: null })
      .mockResolvedValueOnce({ data: mockRecipes, error: null })

    const { result } = renderHook(() => useStockAlerts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.data?.lowIngredients).toHaveLength(1)
    expect(result.current.data?.lowIngredients[0].id).toBe('i1')
    expect(result.current.data?.lowProducts).toHaveLength(1)
    expect(result.current.data?.lowProducts[0].id).toBe('p1')
    expect(result.current.data?.total).toBe(2)
  })

  it('retorna total zero quando não há alertas', async () => {
    mockSelect
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({ data: [], error: null })

    const { result } = renderHook(() => useStockAlerts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.data?.total).toBe(0)
  })

  it('consulta as tabelas ingredients, products e recipes', async () => {
    mockSelect
      .mockResolvedValueOnce({ data: mockIngredients, error: null })
      .mockResolvedValueOnce({ data: mockProducts, error: null })
      .mockResolvedValueOnce({ data: mockRecipes, error: null })

    const { result } = renderHook(() => useStockAlerts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockFrom).toHaveBeenCalledWith('ingredients')
    expect(mockFrom).toHaveBeenCalledWith('products')
    expect(mockFrom).toHaveBeenCalledWith('recipes')
  })

  it('retorna isLoading true inicialmente', () => {
    mockSelect.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useStockAlerts(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
  })

  it('trata erro do supabase em ingredients', async () => {
    mockSelect
      .mockResolvedValueOnce({ data: null, error: { message: 'DB error' } })
      .mockResolvedValueOnce({ data: mockProducts, error: null })
      .mockResolvedValueOnce({ data: mockRecipes, error: null })

    const { result } = renderHook(() => useStockAlerts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBeTruthy()
    expect(result.current.data).toBeUndefined()
  })
})
