import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const mockGetStockAlertData = vi.hoisted(() => vi.fn())
vi.mock('@/app/actions/dashboard', () => ({
  getStockAlertData: mockGetStockAlertData,
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

const mockAlertData = {
  lowIngredients: [
    { id: 'i1', name: 'Farinha', unit: 'kg', current_stock: 0.3, min_stock: 0.5, threshold: 0.8, source: 'recipe' as const },
  ],
  lowProducts: [
    { id: 'p1', name: 'Bolo', stock: 2, min_stock: 5 },
  ],
  total: 2,
}

describe('useStockAlerts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna isLoading true inicialmente', () => {
    mockGetStockAlertData.mockImplementation(() => new Promise(() => {}))
    const { result } = renderHook(() => useStockAlerts(), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(true)
  })

  it('retorna alertas de estoque da server action', async () => {
    mockGetStockAlertData.mockResolvedValueOnce(mockAlertData)
    const { result } = renderHook(() => useStockAlerts(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.lowIngredients).toHaveLength(1)
    expect(result.current.data?.lowIngredients[0].id).toBe('i1')
    expect(result.current.data?.lowProducts).toHaveLength(1)
    expect(result.current.data?.lowProducts[0].id).toBe('p1')
    expect(result.current.data?.total).toBe(2)
  })

  it('retorna total zero quando não há alertas', async () => {
    mockGetStockAlertData.mockResolvedValueOnce({ lowIngredients: [], lowProducts: [], total: 0 })
    const { result } = renderHook(() => useStockAlerts(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.total).toBe(0)
  })

  it('propaga erro da server action', async () => {
    mockGetStockAlertData.mockRejectedValueOnce(new Error('DB error'))
    const { result } = renderHook(() => useStockAlerts(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
