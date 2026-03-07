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

import { useProducts } from '@/hooks/useProducts'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return QueryClientProvider({ client: queryClient, children })
  }
}

const mockProducts = [
  { id: '1', name: 'Bolo de Chocolate', price: 50, cost: 20, stock: 10, min_stock: 5, category: 'Bolos' },
  { id: '2', name: 'Brigadeiro', price: 3, cost: 1, stock: 100, min_stock: 20, category: 'Doces' },
]

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch products successfully', async () => {
    mockSelect.mockResolvedValueOnce({ data: mockProducts, error: null })

    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockProducts)
    expect(mockFrom).toHaveBeenCalledWith('products')
  })

  it('should handle error from supabase', async () => {
    mockSelect.mockResolvedValueOnce({ data: null, error: { message: 'Database error' } })

    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual({ message: 'Database error' })
  })
})
