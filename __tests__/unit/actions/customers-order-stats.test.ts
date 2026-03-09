import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/headers', () => ({ cookies: vi.fn().mockResolvedValue({}) }))

const mockFrom = vi.fn()
const mockSupabase = { from: mockFrom }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

vi.mock('@/lib/supabase/tenant', () => ({ getTenantId: vi.fn().mockResolvedValue('test-tenant-id') }))

import { updateCustomerStats, getCustomerOrders } from '@/app/actions/customers'

describe('customer order stats actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('updateCustomerStats', () => {
    it('calcula e salva total_orders e total_spent corretamente', async () => {
      const orders = [
        { total: 100 },
        { total: 200 },
        { total: 50 },
      ]

      const updateEqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const updateEqIdMock = vi.fn().mockReturnValue({ eq: updateEqTenantMock })
      const updateMock = vi.fn().mockReturnValue({ eq: updateEqIdMock })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: orders, error: null }),
              }),
            }),
          }
        }
        if (table === 'customers') {
          return { update: updateMock }
        }
        return {}
      })

      await updateCustomerStats('cust-1')

      expect(updateMock).toHaveBeenCalledWith({
        total_orders: 3,
        total_spent: 350,
      })
      expect(updateEqIdMock).toHaveBeenCalledWith('id', 'cust-1')
    })

    it('define stats como zero quando cliente nao tem pedidos', async () => {
      const updateEqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const updateEqIdMock = vi.fn().mockReturnValue({ eq: updateEqTenantMock })
      const updateMock = vi.fn().mockReturnValue({ eq: updateEqIdMock })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          }
        }
        if (table === 'customers') {
          return { update: updateMock }
        }
        return {}
      })

      await updateCustomerStats('cust-2')

      expect(updateMock).toHaveBeenCalledWith({
        total_orders: 0,
        total_spent: 0,
      })
    })

    it('lanca erro quando consulta de pedidos falha', async () => {
      const dbError = { message: 'DB error' }

      mockFrom.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: null, error: dbError }),
              }),
            }),
          }
        }
        return {}
      })

      await expect(updateCustomerStats('cust-1')).rejects.toEqual(dbError)
    })
  })

  describe('getCustomerOrders', () => {
    it('retorna pedidos de um cliente com itens e produtos', async () => {
      const orders = [
        {
          id: 'order-1',
          total: 150,
          status: 'Finalizado',
          created_at: '2026-03-01',
          order_items: [{ product_id: 'p-1', quantity: 2, unit_price: 75, products: { name: 'Bolo' } }],
        },
      ]

      const orderMock = vi.fn().mockResolvedValue({ data: orders, error: null })
      const eqTenantMock = vi.fn().mockReturnValue({ order: orderMock })
      const eqCustomerMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const selectMock = vi.fn().mockReturnValue({ eq: eqCustomerMock })
      mockFrom.mockReturnValue({ select: selectMock })

      const result = await getCustomerOrders('cust-1')

      expect(mockFrom).toHaveBeenCalledWith('orders')
      expect(eqCustomerMock).toHaveBeenCalledWith('customer_id', 'cust-1')
      expect(result).toEqual(orders)
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      const orderMock = vi.fn().mockResolvedValue({ data: null, error: dbError })
      const eqTenantMock = vi.fn().mockReturnValue({ order: orderMock })
      const eqCustomerMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const selectMock = vi.fn().mockReturnValue({ eq: eqCustomerMock })
      mockFrom.mockReturnValue({ select: selectMock })

      await expect(getCustomerOrders('cust-1')).rejects.toEqual(dbError)
    })
  })
})
