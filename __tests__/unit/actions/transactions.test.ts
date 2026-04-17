import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/headers', () => ({ cookies: vi.fn().mockResolvedValue({}) }))

const mockFrom = vi.fn()
const mockSupabase = { from: mockFrom }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

vi.mock('@/lib/supabase/tenant', () => ({ getTenantId: vi.fn().mockResolvedValue('test-tenant-id') }))

import { getTransactions, getMonthSummary, getFinancialSummary } from '@/app/actions/transactions'

describe('transactions actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTransactions', () => {
    it('retorna transacoes combinadas e ordenadas por data', async () => {
      const revenues = [
        { id: '1', date: '2024-01-15', description: 'Venda', total: 100 },
      ]
      const expenses = [
        { id: '2', date: '2024-01-16', description: 'Compra', total: 50 },
      ]

      mockFrom.mockImplementation((table: string) => {
        const chain = {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                lte: vi.fn().mockResolvedValue({
                  data: table === 'revenue_entries' ? revenues : expenses,
                  error: null,
                }),
              }),
            }),
          }),
        }
        return chain
      })

      const result = await getTransactions('2024-01-01', '2024-01-31')

      expect(result).toHaveLength(2)
      // Sorted by date descending: expense (16th) comes first
      expect(result[0]).toMatchObject({ id: '2', type: 'Despesa', total: -50 })
      expect(result[1]).toMatchObject({ id: '1', type: 'Receita', total: 100 })
    })

    it('inclui category nas despesas e null nas receitas', async () => {
      const revenues = [{ id: '1', date: '2024-01-15', description: 'Venda', total: 100 }]
      const expenses = [{ id: '2', date: '2024-01-16', description: 'Insumo', total: 50, category: 'Ingredientes' }]

      mockFrom.mockImplementation((table: string) => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockResolvedValue({
                data: table === 'revenue_entries' ? revenues : expenses,
                error: null,
              }),
            }),
          }),
        }),
      }))

      const result = await getTransactions('2024-01-01', '2024-01-31')

      const expense = result.find(t => t.id === '2')
      const revenue = result.find(t => t.id === '1')
      expect(expense?.category).toBe('Ingredientes')
      expect(revenue?.category).toBeNull()
    })

    it('lanca erro quando query de revenues falha', async () => {
      const dbError = { message: 'DB error' }

      mockFrom.mockImplementation((table: string) => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockResolvedValue({
                data: table === 'revenue_entries' ? null : [],
                error: table === 'revenue_entries' ? dbError : null,
              }),
            }),
          }),
        }),
      }))

      await expect(getTransactions('2024-01-01', '2024-01-31')).rejects.toEqual(dbError)
    })

    it('lanca erro quando query de expenses falha', async () => {
      const dbError = { message: 'DB error' }

      mockFrom.mockImplementation((table: string) => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockResolvedValue({
                data: table === 'expense_entries' ? null : [],
                error: table === 'expense_entries' ? dbError : null,
              }),
            }),
          }),
        }),
      }))

      await expect(getTransactions('2024-01-01', '2024-01-31')).rejects.toEqual(dbError)
    })
  })

  describe('getMonthSummary', () => {
    it('retorna resumo mensal', async () => {
      const summary = { month: 1, year: 2024, total_revenue: 1000, total_expense: 500 }
      const eqYear = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: summary, error: null }),
      })
      const eqMonth = vi.fn().mockReturnValue({ eq: eqYear })
      const eqTenant = vi.fn().mockReturnValue({ eq: eqMonth })

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: eqTenant,
        }),
      })

      const result = await getMonthSummary(1, 2024)
      expect(mockFrom).toHaveBeenCalledWith('monthly_closures')
      expect(result).toEqual(summary)
    })

    it('retorna null quando nenhum registro encontrado (PGRST116)', async () => {
      const notFoundError = { message: 'No rows', code: 'PGRST116' }
      const eqYear = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: notFoundError }),
      })
      const eqMonth = vi.fn().mockReturnValue({ eq: eqYear })
      const eqTenant = vi.fn().mockReturnValue({ eq: eqMonth })

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: eqTenant,
        }),
      })

      const result = await getMonthSummary(1, 2024)
      expect(result).toBeNull()
    })

    it('lanca erro para erros que nao sao PGRST116', async () => {
      const dbError = { message: 'DB error', code: 'OTHER' }
      const eqYear = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: dbError }),
      })
      const eqMonth = vi.fn().mockReturnValue({ eq: eqYear })
      const eqTenant = vi.fn().mockReturnValue({ eq: eqMonth })

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: eqTenant,
        }),
      })

      await expect(getMonthSummary(1, 2024)).rejects.toEqual(dbError)
    })
  })

  describe('getFinancialSummary', () => {
    function mockFinancialData(
      revenues: { total: number; created_at: string }[],
      expenses: { total: number; category: string; created_at: string }[]
    ) {
      mockFrom.mockImplementation((table: string) => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: table === 'revenue_entries' ? revenues : expenses,
            error: null,
          }),
        }),
      }))
    }

    it('calcula totalRevenue, totalExpenses, netProfit e profitMargin corretamente', async () => {
      mockFinancialData(
        [{ total: 1000, created_at: '2024-01-10' }, { total: 500, created_at: '2024-01-20' }],
        [{ total: 300, category: 'Ingredientes', created_at: '2024-01-05' }]
      )

      const result = await getFinancialSummary()

      expect(result.totalRevenue).toBe(1500)
      expect(result.totalExpenses).toBe(300)
      expect(result.netProfit).toBe(1200)
      expect(result.profitMargin).toBeCloseTo(80)
    })

    it('retorna profitMargin 0 quando totalRevenue e zero', async () => {
      mockFinancialData([], [{ total: 100, category: 'Outros', created_at: '2024-01-01' }])

      const result = await getFinancialSummary()

      expect(result.totalRevenue).toBe(0)
      expect(result.profitMargin).toBe(0)
    })

    it('retorna revenueVsExpensesData com 6 entradas', async () => {
      mockFinancialData([], [])

      const result = await getFinancialSummary()

      expect(result.revenueVsExpensesData).toHaveLength(6)
      result.revenueVsExpensesData.forEach(entry => {
        expect(entry).toHaveProperty('name')
        expect(entry).toHaveProperty('Receitas')
        expect(entry).toHaveProperty('Despesas')
      })
    })

    it('agrupa expensesByCategoryChartData por categoria', async () => {
      mockFinancialData(
        [],
        [
          { total: 200, category: 'Ingredientes', created_at: '2024-01-01' },
          { total: 150, category: 'Ingredientes', created_at: '2024-01-02' },
          { total: 100, category: 'Embalagens', created_at: '2024-01-03' },
        ]
      )

      const result = await getFinancialSummary()

      const ingredientes = result.expensesByCategoryChartData.find(d => d.name === 'Ingredientes')
      const embalagens = result.expensesByCategoryChartData.find(d => d.name === 'Embalagens')
      expect(ingredientes?.value).toBe(350)
      expect(embalagens?.value).toBe(100)
    })

    it('usa tenant_id em todas as queries', async () => {
      mockFinancialData([], [])

      await getFinancialSummary()

      const { getTenantId } = await import('@/lib/supabase/tenant')
      expect(getTenantId).toHaveBeenCalled()
    })

    it('lanca erro quando query de revenues falha', async () => {
      const dbError = { message: 'DB error' }
      mockFrom.mockImplementation((table: string) => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: table === 'revenue_entries' ? null : [],
            error: table === 'revenue_entries' ? dbError : null,
          }),
        }),
      }))

      await expect(getFinancialSummary()).rejects.toEqual(dbError)
    })

    it('lanca erro quando query de expenses falha', async () => {
      const dbError = { message: 'DB error' }
      mockFrom.mockImplementation((table: string) => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: table === 'expense_entries' ? null : [],
            error: table === 'expense_entries' ? dbError : null,
          }),
        }),
      }))

      await expect(getFinancialSummary()).rejects.toEqual(dbError)
    })
  })
})
