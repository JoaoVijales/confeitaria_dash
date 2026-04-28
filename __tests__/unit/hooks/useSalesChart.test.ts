import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const mockGetSalesChartData = vi.hoisted(() => vi.fn())
vi.mock('@/app/actions/dashboard', () => ({
  getSalesChartData: mockGetSalesChartData,
}))

import { useSalesChart } from '@/hooks/useSalesChart'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return QueryClientProvider({ client: queryClient, children })
  }
}

describe('useSalesChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna isLoading true inicialmente', () => {
    mockGetSalesChartData.mockImplementation(() => new Promise(() => {}))
    const { result } = renderHook(() => useSalesChart(), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(true)
  })

  it('retorna dados do gráfico quando action bem-sucedida', async () => {
    const mockData = [
      { name: 'seg.', vendas: 150 },
      { name: 'ter.', vendas: 200 },
    ]
    mockGetSalesChartData.mockResolvedValueOnce(mockData)
    const { result } = renderHook(() => useSalesChart(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockData)
  })

  it('retorna array vazio quando não há pedidos', async () => {
    mockGetSalesChartData.mockResolvedValueOnce([])
    const { result } = renderHook(() => useSalesChart(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })

  it('propaga erro da server action', async () => {
    mockGetSalesChartData.mockRejectedValueOnce(new Error('DB error'))
    const { result } = renderHook(() => useSalesChart(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
