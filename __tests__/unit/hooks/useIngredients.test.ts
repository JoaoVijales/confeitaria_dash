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
  { id: '1', name: 'Farinha', unit: 'kg', unit_cost: 5.0, stock: 50 },
  { id: '2', name: 'Acucar', unit: 'kg', unit_cost: 4.0, stock: 30 },
]

describe('useIngredients', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch ingredients successfully', async () => {
    mockSelect.mockResolvedValueOnce({ data: mockIngredients, error: null })

    const { result } = renderHook(() => useIngredients(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockIngredients)
    expect(mockFrom).toHaveBeenCalledWith('ingredients')
    expect(mockSelect).toHaveBeenCalledWith('*')
  })

  it('should handle error from supabase', async () => {
    mockSelect.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } })

    const { result } = renderHook(() => useIngredients(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual({ message: 'DB error' })
  })
})
