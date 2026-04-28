import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const mockGetTopProductsChartData = vi.hoisted(() => vi.fn())
vi.mock('@/app/actions/dashboard', () => ({
  getTopProductsChartData: mockGetTopProductsChartData,
}))

import { useTopProductsChart } from '@/hooks/useTopProductsChart'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return QueryClientProvider({ client: queryClient, children })
  }
}

const mockChartData = [
  { name: 'Bolo de Chocolate', vendidos: 15 },
  { name: 'Brigadeiro', vendidos: 8 },
  { name: 'Cupcake', vendidos: 7 },
  { name: 'Torta de Limão', vendidos: 3 },
  { name: 'Cookie', vendidos: 2 },
]

describe('useTopProductsChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna isLoading true inicialmente', () => {
    mockGetTopProductsChartData.mockImplementation(() => new Promise(() => {}))
    const { result } = renderHook(() => useTopProductsChart(), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(true)
  })

  it('retorna dados do gráfico quando action bem-sucedida', async () => {
    mockGetTopProductsChartData.mockResolvedValueOnce(mockChartData)
    const { result } = renderHook(() => useTopProductsChart(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockChartData)
  })

  it('retorna array vazio quando não há itens', async () => {
    mockGetTopProductsChartData.mockResolvedValueOnce([])
    const { result } = renderHook(() => useTopProductsChart(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })

  it('propaga erro da server action', async () => {
    mockGetTopProductsChartData.mockRejectedValueOnce(new Error('DB error'))
    const { result } = renderHook(() => useTopProductsChart(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
