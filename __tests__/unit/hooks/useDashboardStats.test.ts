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

import { useDashboardStats } from '@/hooks/useDashboardStats'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return QueryClientProvider({ client: queryClient, children })
  }
}

const now = new Date()
const currentMonth = now.getMonth()
const currentYear = now.getFullYear()
const thisMonthDate = new Date(currentYear, currentMonth, 15).toISOString()
const lastMonthDate = new Date(currentYear, currentMonth - 1, 15).toISOString()

const mockOrders = [
  { total: 500, created_at: thisMonthDate },
  { total: 300, created_at: thisMonthDate },
  { total: 200, created_at: lastMonthDate },
]

const mockExpenses = [
  { amount: 100, date: thisMonthDate, category: 'Ingredientes' },
  { amount: 50, date: thisMonthDate, category: 'Fixo' },
  { amount: 200, date: lastMonthDate, category: 'Ingredientes' },
]

const mockProductsWithRecipes = [
  {
    price: 50,
    name: 'Bolo de Chocolate',
    recipes: [
      {
        yield: 10,
        recipe_ingredients: [
          { quantity: 2, ingredients: { unit_cost: 5 } },
          { quantity: 1, ingredients: { unit_cost: 10 } },
        ],
      },
    ],
  },
  {
    price: 30,
    name: 'Brigadeiro',
    recipes: [],
  },
]

const mockDailySales = [{ total: 150 }, { total: 100 }]
const mockOpenOrders = [{ id: '1' }, { id: '2' }]
const mockOrderItems = [
  { quantity: 5, products: [{ name: 'Bolo de Chocolate' }] },
  { quantity: 3, products: [{ name: 'Brigadeiro' }] },
  { quantity: 2, products: [{ name: 'Bolo de Chocolate' }] },
]

describe('useDashboardStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should compute dashboard stats correctly', async () => {
    let selectCallCount = 0
    mockSelect.mockImplementation(() => {
      selectCallCount++
      if (selectCallCount === 1) {
        return Promise.resolve({ data: mockOrders, error: null })
      }
      if (selectCallCount === 2) {
        return Promise.resolve({ data: mockExpenses, error: null })
      }
      if (selectCallCount === 3) {
        return Promise.resolve({ data: mockProductsWithRecipes, error: null })
      }
      if (selectCallCount === 4) {
        return {
          gte: vi.fn().mockResolvedValue({ data: mockDailySales, error: null }),
        }
      }
      if (selectCallCount === 5) {
        return {
          in: vi.fn().mockResolvedValue({ data: mockOpenOrders, error: null }),
        }
      }
      if (selectCallCount === 6) {
        return {
          limit: vi.fn().mockResolvedValue({ data: mockOrderItems, error: null }),
        }
      }
      return Promise.resolve({ data: [], error: null })
    })

    const { result } = renderHook(() => useDashboardStats(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const data = result.current.data!

    // monthlyRevenue = 500 + 300 = 800 (only this month orders)
    // monthlyExpenses = 100 + 50 = 150 (only this month expenses)
    // monthlyProfit = 800 - 150 = 650
    expect(data.monthlyProfit).toBe(650)

    // dailySales total = 150 + 100 = 250
    expect(data.dailySales.total).toBe(250)

    // openOrders count = 2
    expect(data.openOrders.count).toBe(2)

    // topSellingProduct: Bolo=7, Brigadeiro=3 -> Bolo
    expect(data.topSellingProduct.name).toBe('Bolo de Chocolate')
    expect(data.topSellingProduct.count).toBe(7)

    // averageMargin: Bolo cost = (2*5 + 1*10)/10 = 2, margin = (50-2)/50*100 = 96%
    // Brigadeiro cost=0, skipped in margin but counted in divisor
    // totalMargin = 96, averageMargin = 96/2 = 48
    expect(data.averageMargin).toBe(48)

    // topProfitableProducts
    expect(data.topProfitableProducts).toHaveLength(2)
    expect(data.topProfitableProducts[0].name).toBe('Bolo de Chocolate')
    expect(data.topProfitableProducts[0].Lucro).toBe(48) // 50 - 2

    // expensesByCategoryChartData includes all expenses (not just this month)
    expect(data.expensesByCategoryChartData).toEqual(
      expect.arrayContaining([
        { name: 'Ingredientes', value: 300 },
        { name: 'Fixo', value: 50 },
      ])
    )
  })

  it('should handle supabase error on orders', async () => {
    mockSelect.mockResolvedValueOnce({ data: null, error: { message: 'Orders error' } })

    const { result } = renderHook(() => useDashboardStats(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
