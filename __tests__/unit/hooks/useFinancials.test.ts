import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const mockGetFinancialSummary = vi.fn()
const mockGetMonthSummary = vi.fn()
const mockGetTransactions = vi.fn()

vi.mock('@/app/actions/transactions', () => ({
  getFinancialSummary: (...args: unknown[]) => mockGetFinancialSummary(...args),
  getMonthSummary: (...args: unknown[]) => mockGetMonthSummary(...args),
  getTransactions: (...args: unknown[]) => mockGetTransactions(...args),
}))

import { useFinancials } from '@/hooks/useFinancials'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return QueryClientProvider({ client: queryClient, children })
  }
}

const mockSummary = {
  totalRevenue: 5000,
  totalExpenses: 2000,
  netProfit: 3000,
  profitMargin: 60,
  revenueVsExpensesData: [],
  expensesByCategoryChartData: [],
}

const mockMonthlySummary = { month: 4, year: 2026, total_revenue: 1500 }

const mockTransactions = [
  { id: '1', date: '2026-04-10', description: 'Venda', total: 150, type: 'Receita' as const, category: null },
]

describe('useFinancials', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna isLoading true inicialmente', () => {
    mockGetFinancialSummary.mockImplementation(() => new Promise(() => {}))
    mockGetMonthSummary.mockResolvedValue(mockMonthlySummary)
    mockGetTransactions.mockResolvedValue(mockTransactions)
    const { result } = renderHook(() => useFinancials(), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(true)
  })

  it('combina dados das 3 actions corretamente', async () => {
    mockGetFinancialSummary.mockResolvedValueOnce(mockSummary)
    mockGetMonthSummary.mockResolvedValueOnce(mockMonthlySummary)
    mockGetTransactions.mockResolvedValueOnce(mockTransactions)

    const { result } = renderHook(() => useFinancials(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const data = result.current.data!
    expect(data.totalRevenue).toBe(5000)
    expect(data.netProfit).toBe(3000)
    expect(data.monthlySummary).toEqual(mockMonthlySummary)
    expect(data.recentTransactions).toEqual(mockTransactions)
  })

  it('chama as 3 actions em paralelo', async () => {
    mockGetFinancialSummary.mockResolvedValueOnce(mockSummary)
    mockGetMonthSummary.mockResolvedValueOnce(mockMonthlySummary)
    mockGetTransactions.mockResolvedValueOnce(mockTransactions)

    const { result } = renderHook(() => useFinancials(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockGetFinancialSummary).toHaveBeenCalledTimes(1)
    expect(mockGetMonthSummary).toHaveBeenCalledTimes(1)
    expect(mockGetTransactions).toHaveBeenCalledTimes(1)
  })

  it('propaga erros de qualquer action', async () => {
    mockGetFinancialSummary.mockRejectedValueOnce(new Error('Falha'))
    mockGetMonthSummary.mockResolvedValue(mockMonthlySummary)
    mockGetTransactions.mockResolvedValue(mockTransactions)

    const { result } = renderHook(() => useFinancials(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeInstanceOf(Error)
  })
})
