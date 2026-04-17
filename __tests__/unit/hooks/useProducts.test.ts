import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const mockGetProducts = vi.hoisted(() => vi.fn())

vi.mock('@/app/actions/products', () => ({
  getProducts: mockGetProducts,
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  checkLowStock: vi.fn(),
  getProductComponents: vi.fn(),
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

  it('retorna lista de produtos da server action', async () => {
    mockGetProducts.mockResolvedValueOnce(mockProducts)

    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockProducts)
  })

  it('propaga erro da server action', async () => {
    mockGetProducts.mockRejectedValueOnce(new Error('DB error'))

    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect((result.current.error as Error).message).toBe('DB error')
  })
})
