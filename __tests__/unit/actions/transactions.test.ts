import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/headers', () => ({ cookies: vi.fn().mockResolvedValue({}) }))

const mockFrom = vi.fn()
const mockSupabase = { from: mockFrom }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

vi.mock('@/lib/supabase/tenant', () => ({ getTenantId: vi.fn().mockResolvedValue('test-tenant-id') }))

import { getTransactions, getMonthSummary } from '@/app/actions/transactions'

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
})
