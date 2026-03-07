import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const { mockIn, mockSelect, mockFrom } = vi.hoisted(() => {
  const mockIn = vi.fn()
  const mockSelect = vi.fn(() => ({ in: mockIn }))
  const mockFrom = vi.fn(() => ({ select: mockSelect }))
  return { mockIn, mockSelect, mockFrom }
})

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
}))

import { useRecipeCost } from '@/hooks/useRecipeCost'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return QueryClientProvider({ client: queryClient, children })
  }
}

const recipeIngredients = [
  { ingredient_id: 'i1', quantity: 250, unit: 'g' as const },
  { ingredient_id: 'i2', quantity: 100, unit: 'ml' as const },
]

const mockIngredients = [
  { id: 'i1', name: 'Farinha', unit: 'kg', unit_cost: 5.5 },
  { id: 'i2', name: 'Oleo', unit: 'L', unit_cost: 8.0 },
]

// 250g * 5.5/kg = 0.250 * 5.5 = 1.375
// 100ml * 8.0/L = 0.100 * 8.0 = 0.800
// totalCost = 2.175
// costPerPortion (2 portions) = 2.175 / 2 = 1.0875

describe('useRecipeCost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna totalCost e costPerPortion corretos apos carregar ingredientes', async () => {
    mockIn.mockResolvedValueOnce({ data: mockIngredients, error: null })

    const { result } = renderHook(
      () => useRecipeCost(recipeIngredients, 2),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.totalCost).toBeCloseTo(2.175, 5)
    expect(result.current.costPerPortion).toBeCloseTo(1.0875, 5)
    expect(result.current.error).toBeNull()
  })

  it('consulta a tabela ingredients com os IDs corretos', async () => {
    mockIn.mockResolvedValueOnce({ data: mockIngredients, error: null })

    const { result } = renderHook(
      () => useRecipeCost(recipeIngredients, 2),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockFrom).toHaveBeenCalledWith('ingredients')
    expect(mockSelect).toHaveBeenCalledWith('*')
    expect(mockIn).toHaveBeenCalledWith('id', ['i1', 'i2'])
  })

  it('retorna isLoading true inicialmente', () => {
    mockIn.mockReturnValueOnce(new Promise(() => {}))

    const { result } = renderHook(
      () => useRecipeCost(recipeIngredients, 2),
      { wrapper: createWrapper() }
    )

    expect(result.current.isLoading).toBe(true)
  })

  it('trata erro do supabase e retorna error preenchido', async () => {
    mockIn.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } })

    const { result } = renderHook(
      () => useRecipeCost(recipeIngredients, 2),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBeTruthy()
    expect(result.current.totalCost).toBeUndefined()
    expect(result.current.costPerPortion).toBeUndefined()
  })

  it('retorna totalCost zero para lista de ingredientes vazia', async () => {
    mockIn.mockResolvedValueOnce({ data: [], error: null })

    const { result } = renderHook(
      () => useRecipeCost([], 1),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.totalCost).toBe(0)
    expect(result.current.costPerPortion).toBe(0)
  })
})
