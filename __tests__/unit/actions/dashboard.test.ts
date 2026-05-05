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

// Queries issued by getDashboardStats per table:
//   revenue_entries  ×3 — curRevenues (.gte.lte), prevRevenues (.gte.lte), dailySales (.eq)
//   expense_entries  ×2 — curExpenses (.gte.lte), prevExpenses (.gte.lte)
//   products         ×1 — (.eq resolved)
//   orders           ×1 — openOrders (.in)
//   order_items      ×1 — topSelling (.limit)

function buildRevenueMock(callData: { data: object[]; error: null }[]) {
  let callCount = 0
  return () => {
    const idx = callCount++
    const entry = callData[idx] ?? { data: [], error: null }
    if (idx === 2) {
      // dailySales: .eq('tenant_id').eq('date') — no gte/lte
      const eq2 = vi.fn().mockResolvedValue(entry)
      const eq1 = vi.fn().mockReturnValue({ eq: eq2 })
      return { select: vi.fn().mockReturnValue({ eq: eq1 }) }
    }
    // curRevenues / prevRevenues: .eq('tenant_id').gte().lte()
    const lte = vi.fn().mockResolvedValue(entry)
    const gte = vi.fn().mockReturnValue({ lte })
    const eq = vi.fn().mockReturnValue({ gte })
    return { select: vi.fn().mockReturnValue({ eq }) }
  }
}

function buildExpenseMock(callData: { data: object[]; error: null }[]) {
  let callCount = 0
  return () => {
    const entry = callData[callCount++] ?? { data: [], error: null }
    const lte = vi.fn().mockResolvedValue(entry)
    const gte = vi.fn().mockReturnValue({ lte })
    const eq = vi.fn().mockReturnValue({ gte })
    return { select: vi.fn().mockReturnValue({ eq }) }
  }
}

function buildDefaultMocks(overrides: Record<string, () => object> = {}) {
  const revenueFactory = overrides['revenue_entries'] ?? buildRevenueMock([])
  const expenseFactory = overrides['expense_entries'] ?? buildExpenseMock([])

  return (table: string) => {
    if (table === 'revenue_entries') return revenueFactory()
    if (table === 'expense_entries') return expenseFactory()
    if (table === 'products') {
      return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) }) }
    }
    if (table === 'orders') {
      const inFn = vi.fn().mockResolvedValue({ data: [], error: null })
      return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ in: inFn }) }) }
    }
    // order_items
    const limit = vi.fn().mockResolvedValue({ data: overrides['order_items_data'] ?? [], error: null })
    return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ limit }) }) }
  }
}

describe('getDashboardStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('usa tenant_id em todas as queries', async () => {
    const eqFirstArgs: unknown[] = []
    let revCount = 0

    mockFrom.mockImplementation((table: string) => {
      if (table === 'revenue_entries') {
        const idx = revCount++
        if (idx === 2) {
          // dailySales: double eq
          const eq2 = vi.fn().mockResolvedValue({ data: [], error: null })
          const eq1 = vi.fn().mockImplementation((col: string, val: unknown) => {
            if (col === 'tenant_id') eqFirstArgs.push(val)
            return { eq: eq2 }
          })
          return { select: vi.fn().mockReturnValue({ eq: eq1 }) }
        }
        const lte = vi.fn().mockResolvedValue({ data: [], error: null })
        const gte = vi.fn().mockReturnValue({ lte })
        const eq = vi.fn().mockImplementation((col: string, val: unknown) => {
          if (col === 'tenant_id') eqFirstArgs.push(val)
          return { gte }
        })
        return { select: vi.fn().mockReturnValue({ eq }) }
      }
      if (table === 'expense_entries') {
        const lte = vi.fn().mockResolvedValue({ data: [], error: null })
        const gte = vi.fn().mockReturnValue({ lte })
        const eq = vi.fn().mockImplementation((col: string, val: unknown) => {
          if (col === 'tenant_id') eqFirstArgs.push(val)
          return { gte }
        })
        return { select: vi.fn().mockReturnValue({ eq }) }
      }
      if (table === 'products') {
        const eq = vi.fn().mockImplementation((col: string, val: unknown) => {
          if (col === 'tenant_id') eqFirstArgs.push(val)
          return Promise.resolve({ data: [], error: null })
        })
        return { select: vi.fn().mockReturnValue({ eq }) }
      }
      if (table === 'orders') {
        const inFn = vi.fn().mockResolvedValue({ data: [], error: null })
        const eq = vi.fn().mockImplementation((col: string, val: unknown) => {
          if (col === 'tenant_id') eqFirstArgs.push(val)
          return { in: inFn }
        })
        return { select: vi.fn().mockReturnValue({ eq }) }
      }
      // order_items
      const limit = vi.fn().mockResolvedValue({ data: [], error: null })
      const eq = vi.fn().mockImplementation((col: string, val: unknown) => {
        if (col === 'tenant_id') eqFirstArgs.push(val)
        return { limit }
      })
      return { select: vi.fn().mockReturnValue({ eq }) }
    })

    await getDashboardStats()

    // 8 tenant-scoped queries in total
    expect(eqFirstArgs.length).toBe(8)
    for (const val of eqFirstArgs) {
      expect(val).toBe('tenant-123')
    }
  })

  it('calcula monthlyRevenue e monthlyProfit corretamente', async () => {
    const curRevenues = [{ total: 500 }, { total: 300 }]
    const prevRevenues = [{ total: 200 }]
    const curExpenses = [{ total: 100, category: 'Ingredientes' }]
    const prevExpenses = [{ total: 80 }]

    mockFrom.mockImplementation(buildDefaultMocks({
      'revenue_entries': buildRevenueMock([
        { data: curRevenues, error: null },
        { data: prevRevenues, error: null },
        { data: [], error: null }, // dailySales
      ]),
      'expense_entries': buildExpenseMock([
        { data: curExpenses, error: null },
        { data: prevExpenses, error: null },
      ]),
    }))

    const result = await getDashboardStats()

    expect(result.monthlyRevenue).toBe(800)
    expect(result.monthlyExpenses).toBe(100)
    expect(result.monthlyProfit).toBe(700)
  })

  it('calcula trends comparando mês atual vs mês anterior', async () => {
    // Prev: revenue=200, expenses=80, profit=120
    // Curr: revenue=400, expenses=100, profit=300
    // revenue trend = (400-200)/200*100 = 100%
    // profit trend  = (300-120)/120*100 = 150%
    mockFrom.mockImplementation(buildDefaultMocks({
      'revenue_entries': buildRevenueMock([
        { data: [{ total: 400 }], error: null },
        { data: [{ total: 200 }], error: null },
        { data: [], error: null },
      ]),
      'expense_entries': buildExpenseMock([
        { data: [{ total: 100, category: 'Fixo' }], error: null },
        { data: [{ total: 80 }], error: null },
      ]),
    }))

    const result = await getDashboardStats()

    expect(result.trends.revenue).toBe(100)
    expect(result.trends.profit).toBe(150)
  })

  it('retorna trend 100 quando mes anterior era zero', async () => {
    mockFrom.mockImplementation(buildDefaultMocks({
      'revenue_entries': buildRevenueMock([
        { data: [{ total: 500 }], error: null },
        { data: [], error: null },
        { data: [], error: null },
      ]),
      'expense_entries': buildExpenseMock([
        { data: [], error: null },
        { data: [], error: null },
      ]),
    }))

    const result = await getDashboardStats()
    expect(result.trends.revenue).toBe(100)
  })

  it('identifica topSellingProduct corretamente', async () => {
    const orderItems = [
      { quantity: 5, products: [{ name: 'Bolo' }] },
      { quantity: 3, products: [{ name: 'Brownie' }] },
      { quantity: 2, products: [{ name: 'Bolo' }] },
    ]

    const limitMock = vi.fn().mockResolvedValue({ data: orderItems, error: null })
    const originalDefault = buildDefaultMocks()

    mockFrom.mockImplementation((table: string) => {
      if (table === 'order_items') {
        return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ limit: limitMock }) }) }
      }
      return originalDefault(table)
    })

    const result = await getDashboardStats()

    expect(result.topSellingProduct.name).toBe('Bolo')
    expect(result.topSellingProduct.count).toBe(7)
  })

  it('lanca erro quando query de revenues falha', async () => {
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
