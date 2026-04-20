import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/headers', () => ({ cookies: vi.fn().mockResolvedValue({}) }))

const mockFrom = vi.fn()
const mockSupabase = { from: mockFrom }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

vi.mock('@/lib/supabase/tenant', () => ({
  getTenantId: vi.fn().mockResolvedValue('tenant-123'),
}))

import { getDashboardStats } from '@/app/actions/dashboard'

describe('getDashboardStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('usa tenant_id em todas as queries', async () => {
    const eqMocks: ReturnType<typeof vi.fn>[] = []

    mockFrom.mockImplementation((table: string) => {
      if (table === 'products') {
        const eq = vi.fn().mockResolvedValue({ data: [], error: null })
        eqMocks.push(eq)
        return { select: vi.fn().mockReturnValue({ eq }) }
      }
      if (table === 'order_items') {
        const limit = vi.fn().mockResolvedValue({ data: [], error: null })
        const eq = vi.fn().mockReturnValue({ limit })
        eqMocks.push(eq)
        return { select: vi.fn().mockReturnValue({ eq }) }
      }
      // orders / expenses — gte needs to be both awaitable AND chainable
      const resolved = { data: [], error: null }
      const lte = vi.fn().mockResolvedValue(resolved)
      const lt = vi.fn().mockResolvedValue(resolved)
      const inFn = vi.fn().mockResolvedValue(resolved)
      const gteResult = Object.assign(Promise.resolve(resolved), { lte, lt })
      const gte = vi.fn().mockReturnValue(gteResult)
      const eq = vi.fn().mockReturnValue({ gte, in: inFn })
      eqMocks.push(eq)
      return { select: vi.fn().mockReturnValue({ eq }) }
    })

    await getDashboardStats()

    for (const eq of eqMocks) {
      expect(eq).toHaveBeenCalledWith('tenant_id', 'tenant-123')
    }
  })

  it('calcula monthlyRevenue e monthlyProfit corretamente', async () => {
    const curOrders = [{ total: 500 }, { total: 300 }]
    const prevOrders = [{ total: 200 }]
    const curExpenses = [{ amount: 100, category: 'Ingredientes' }]
    const prevExpenses = [{ amount: 80 }]

    let ordersCallCount = 0
    let expensesCallCount = 0

    mockFrom.mockImplementation((table: string) => {
      if (table === 'orders') {
        ordersCallCount++
        if (ordersCallCount === 1) {
          // current month orders
          const lte = vi.fn().mockResolvedValue({ data: curOrders, error: null })
          const gte = vi.fn().mockReturnValue({ lte })
          return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ gte }) }) }
        }
        if (ordersCallCount === 2) {
          // previous month orders
          const lte = vi.fn().mockResolvedValue({ data: prevOrders, error: null })
          const gte = vi.fn().mockReturnValue({ lte })
          return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ gte }) }) }
        }
        if (ordersCallCount === 3) {
          // today's sales
          const lt = vi.fn().mockResolvedValue({ data: [], error: null })
          const gte = vi.fn().mockReturnValue({ lt })
          return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ gte }) }) }
        }
        // open orders
        const inFn = vi.fn().mockResolvedValue({ data: [], error: null })
        return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ in: inFn }) }) }
      }
      if (table === 'expenses') {
        expensesCallCount++
        if (expensesCallCount === 1) {
          const lte = vi.fn().mockResolvedValue({ data: curExpenses, error: null })
          const gte = vi.fn().mockReturnValue({ lte })
          return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ gte }) }) }
        }
        // previous month expenses
        const lte = vi.fn().mockResolvedValue({ data: prevExpenses, error: null })
        const gte = vi.fn().mockReturnValue({ lte })
        return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ gte }) }) }
      }
      if (table === 'products') {
        return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) }) }
      }
      // order_items
      const limit = vi.fn().mockResolvedValue({ data: [], error: null })
      return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ limit }) }) }
    })

    const result = await getDashboardStats()

    // monthlyRevenue = 500 + 300 = 800
    expect(result.monthlyRevenue).toBe(800)
    // monthlyExpenses = 100
    expect(result.monthlyExpenses).toBe(100)
    // monthlyProfit = 800 - 100 = 700
    expect(result.monthlyProfit).toBe(700)
  })

  it('calcula trends comparando mês atual vs mês anterior', async () => {
    // Prev: revenue=200, expenses=80, profit=120
    // Curr: revenue=400, expenses=100, profit=300
    // revenue trend = (400-200)/200*100 = 100%
    // profit trend = (300-120)/120*100 = 150%
    let ordersCallCount = 0
    let expensesCallCount = 0

    mockFrom.mockImplementation((table: string) => {
      if (table === 'orders') {
        ordersCallCount++
        if (ordersCallCount === 1) {
          const lte = vi.fn().mockResolvedValue({ data: [{ total: 400 }], error: null })
          const gte = vi.fn().mockReturnValue({ lte })
          return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ gte }) }) }
        }
        if (ordersCallCount === 2) {
          const lte = vi.fn().mockResolvedValue({ data: [{ total: 200 }], error: null })
          const gte = vi.fn().mockReturnValue({ lte })
          return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ gte }) }) }
        }
        if (ordersCallCount === 3) {
          const lt = vi.fn().mockResolvedValue({ data: [], error: null })
          const gte = vi.fn().mockReturnValue({ lt })
          return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ gte }) }) }
        }
        const inFn = vi.fn().mockResolvedValue({ data: [], error: null })
        return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ in: inFn }) }) }
      }
      if (table === 'expenses') {
        expensesCallCount++
        if (expensesCallCount === 1) {
          const lte = vi.fn().mockResolvedValue({ data: [{ amount: 100, category: 'Fixo' }], error: null })
          const gte = vi.fn().mockReturnValue({ lte })
          return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ gte }) }) }
        }
        const lte = vi.fn().mockResolvedValue({ data: [{ amount: 80 }], error: null })
        const gte = vi.fn().mockReturnValue({ lte })
        return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ gte }) }) }
      }
      if (table === 'products') {
        return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) }) }
      }
      const limit = vi.fn().mockResolvedValue({ data: [], error: null })
      return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ limit }) }) }
    })

    const result = await getDashboardStats()

    expect(result.trends.revenue).toBe(100)
    expect(result.trends.profit).toBe(150)
  })

  it('retorna trend 100 quando mes anterior era zero', async () => {
    let ordersCallCount = 0
    let expensesCallCount = 0

    mockFrom.mockImplementation((table: string) => {
      if (table === 'orders') {
        ordersCallCount++
        if (ordersCallCount === 1) {
          const lte = vi.fn().mockResolvedValue({ data: [{ total: 500 }], error: null })
          const gte = vi.fn().mockReturnValue({ lte })
          return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ gte }) }) }
        }
        if (ordersCallCount === 2) {
          const lte = vi.fn().mockResolvedValue({ data: [], error: null })
          const gte = vi.fn().mockReturnValue({ lte })
          return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ gte }) }) }
        }
        if (ordersCallCount === 3) {
          const lt = vi.fn().mockResolvedValue({ data: [], error: null })
          const gte = vi.fn().mockReturnValue({ lt })
          return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ gte }) }) }
        }
        const inFn = vi.fn().mockResolvedValue({ data: [], error: null })
        return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ in: inFn }) }) }
      }
      if (table === 'expenses') {
        expensesCallCount++
        if (expensesCallCount === 1) {
          // curExpenses — gte().lte()
          const lte = vi.fn().mockResolvedValue({ data: [], error: null })
          const gte = vi.fn().mockReturnValue({ lte })
          return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ gte }) }) }
        }
        // prevExpenses — gte().lte()
        const lte = vi.fn().mockResolvedValue({ data: [], error: null })
        const gte = vi.fn().mockReturnValue({ lte })
        return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ gte }) }) }
      }
      if (table === 'products') {
        return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) }) }
      }
      const limit = vi.fn().mockResolvedValue({ data: [], error: null })
      return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ limit }) }) }
    })

    const result = await getDashboardStats()
    expect(result.trends.revenue).toBe(100)
  })

  it('identifica topSellingProduct corretamente', async () => {
    const orderItems = [
      { quantity: 5, products: [{ name: 'Bolo' }] },
      { quantity: 3, products: [{ name: 'Brownie' }] },
      { quantity: 2, products: [{ name: 'Bolo' }] },
    ]
    let ordersCallCount = 0
    let expensesCallCount = 0

    mockFrom.mockImplementation((table: string) => {
      if (table === 'order_items') {
        const limit = vi.fn().mockResolvedValue({ data: orderItems, error: null })
        return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ limit }) }) }
      }
      if (table === 'products') {
        return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) }) }
      }
      if (table === 'orders') {
        ordersCallCount++
        if (ordersCallCount === 1) {
          const lte = vi.fn().mockResolvedValue({ data: [], error: null })
          const gte = vi.fn().mockReturnValue({ lte })
          return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ gte }) }) }
        }
        if (ordersCallCount === 2) {
          const lte = vi.fn().mockResolvedValue({ data: [], error: null })
          const gte = vi.fn().mockReturnValue({ lte })
          return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ gte }) }) }
        }
        if (ordersCallCount === 3) {
          const lt = vi.fn().mockResolvedValue({ data: [], error: null })
          const gte = vi.fn().mockReturnValue({ lt })
          return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ gte }) }) }
        }
        const inFn = vi.fn().mockResolvedValue({ data: [], error: null })
        return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ in: inFn }) }) }
      }
      // expenses
      expensesCallCount++
      if (expensesCallCount === 1) {
        const lte = vi.fn().mockResolvedValue({ data: [], error: null })
        const gte = vi.fn().mockReturnValue({ lte })
        return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ gte }) }) }
      }
      const lte = vi.fn().mockResolvedValue({ data: [], error: null })
      const gte = vi.fn().mockReturnValue({ lte })
      return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ gte }) }) }
    })

    const result = await getDashboardStats()

    expect(result.topSellingProduct.name).toBe('Bolo')
    expect(result.topSellingProduct.count).toBe(7)
  })

  it('lanca erro quando query de orders falha', async () => {
    const dbError = { message: 'DB error' }

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            lte: vi.fn().mockResolvedValue({ data: null, error: dbError }),
          }),
        }),
      }),
    })

    await expect(getDashboardStats()).rejects.toEqual(dbError)
  })

  it('lanca erro quando getTenantId falha', async () => {
    const { getTenantId } = await import('@/lib/supabase/tenant')
    vi.mocked(getTenantId).mockRejectedValueOnce(new Error('Não autenticado'))

    await expect(getDashboardStats()).rejects.toThrow('Não autenticado')
    expect(mockFrom).not.toHaveBeenCalled()
  })
})
