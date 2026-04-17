import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const mockGetDashboardStats = vi.fn()

vi.mock('@/app/actions/dashboard', () => ({
  getDashboardStats: (...args: unknown[]) => mockGetDashboardStats(...args),
}))

import { useDashboardStats } from '@/hooks/useDashboardStats'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return QueryClientProvider({ client: queryClient, children })
  }
}

const mockStats = {
  dailySales: { total: 250 },
  openOrders: { count: 2 },
  topSellingProduct: { name: 'Bolo de Chocolate', count: 7 },
  monthlyRevenue: 800,
  monthlyExpenses: 150,
  monthlyProfit: 650,
  averageMargin: 48,
  topProfitableProducts: [
    { name: 'Bolo de Chocolate', Lucro: 48 },
    { name: 'Brigadeiro', Lucro: 30 },
  ],
  expensesByCategoryChartData: [
    { name: 'Ingredientes', value: 300 },
    { name: 'Fixo', value: 50 },
  ],
  trends: {
    revenue: 15.5,
    expenses: -5,
    profit: 30,
  },
}

describe('useDashboardStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna isLoading true inicialmente', () => {
    mockGetDashboardStats.mockImplementation(() => new Promise(() => {}))
    const { result } = renderHook(() => useDashboardStats(), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(true)
  })

  it('retorna os dados da server action corretamente', async () => {
    mockGetDashboardStats.mockResolvedValue(mockStats)
    const { result } = renderHook(() => useDashboardStats(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const data = result.current.data!
    expect(data.monthlyProfit).toBe(650)
    expect(data.monthlyRevenue).toBe(800)
    expect(data.dailySales.total).toBe(250)
    expect(data.openOrders.count).toBe(2)
    expect(data.topSellingProduct.name).toBe('Bolo de Chocolate')
    expect(data.trends.revenue).toBe(15.5)
    expect(data.trends.profit).toBe(30)
  })

  it('delega para getDashboardStats sem argumentos extras', async () => {
    mockGetDashboardStats.mockResolvedValue(mockStats)
    const { result } = renderHook(() => useDashboardStats(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGetDashboardStats).toHaveBeenCalledTimes(1)
    expect(mockGetDashboardStats).toHaveBeenCalledWith()
  })

  it('propaga erros da server action', async () => {
    mockGetDashboardStats.mockRejectedValue(new Error('Falha no servidor'))
    const { result } = renderHook(() => useDashboardStats(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeInstanceOf(Error)
  })
})
