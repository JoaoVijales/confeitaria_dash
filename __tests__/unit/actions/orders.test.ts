import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/headers', () => ({ cookies: vi.fn().mockResolvedValue({}) }))

const mockFrom = vi.fn()
const mockSupabase = { from: mockFrom }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

import { createOrder, updateOrderStatus, deleteOrder, getOrders, getOrderDetails } from '@/app/actions/orders'
import { revalidatePath } from 'next/cache'

const validOrderData = {
  customer_id: 'cust-1',
  items: [
    { product_id: 'prod-1', quantity: 2, unit_price: 10 },
  ],
  total: 20,
  status: 'pending',
}

describe('orders actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createOrder', () => {
    it('cria pedido e itens com dados validos', async () => {
      const itemsInsertMock = vi.fn().mockResolvedValue({ data: null, error: null })

      // First call: orders insert -> select -> single
      // Second call: order_items insert
      let callCount = 0
      mockFrom.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'order-1' },
                  error: null,
                }),
              }),
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }
        }
        if (table === 'order_items') {
          return { insert: itemsInsertMock }
        }
        return {}
      })

      await createOrder(validOrderData)

      expect(itemsInsertMock).toHaveBeenCalledWith([
        { order_id: 'order-1', product_id: 'prod-1', quantity: 2, unit_price: 10 },
      ])
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/pedidos')
    })

    it('lanca erro quando insert do pedido falha', async () => {
      const dbError = { message: 'DB error' }
      mockFrom.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: dbError }),
              }),
            }),
          }
        }
        return {}
      })

      await expect(createOrder(validOrderData)).rejects.toEqual(dbError)
      expect(revalidatePath).not.toHaveBeenCalled()
    })

    it('faz rollback do pedido quando insert de itens falha', async () => {
      const itemsError = { message: 'Items error' }
      const orderDeleteEqMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const orderDeleteMock = vi.fn().mockReturnValue({ eq: orderDeleteEqMock })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'order-1' },
                  error: null,
                }),
              }),
            }),
            delete: orderDeleteMock,
          }
        }
        if (table === 'order_items') {
          return {
            insert: vi.fn().mockResolvedValue({ data: null, error: itemsError }),
          }
        }
        return {}
      })

      await expect(createOrder(validOrderData)).rejects.toEqual(itemsError)
      expect(orderDeleteMock).toHaveBeenCalled()
      expect(orderDeleteEqMock).toHaveBeenCalledWith('id', 'order-1')
    })
  })

  describe('updateOrderStatus', () => {
    it('atualiza status do pedido', async () => {
      const eqMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const updateMock = vi.fn().mockReturnValue({ eq: eqMock })
      mockFrom.mockReturnValue({ update: updateMock })

      await updateOrderStatus('order-1', 'completed')

      expect(mockFrom).toHaveBeenCalledWith('orders')
      expect(updateMock).toHaveBeenCalledWith({ status: 'completed' })
      expect(eqMock).toHaveBeenCalledWith('id', 'order-1')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/pedidos')
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      const eqMock = vi.fn().mockResolvedValue({ data: null, error: dbError })
      const updateMock = vi.fn().mockReturnValue({ eq: eqMock })
      mockFrom.mockReturnValue({ update: updateMock })

      await expect(updateOrderStatus('order-1', 'completed')).rejects.toEqual(dbError)
    })
  })

  describe('deleteOrder', () => {
    it('deleta itens e pedido', async () => {
      const orderEqMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const itemsEqMock = vi.fn().mockResolvedValue({ data: null, error: null })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'order_items') {
          return { delete: vi.fn().mockReturnValue({ eq: itemsEqMock }) }
        }
        if (table === 'orders') {
          return { delete: vi.fn().mockReturnValue({ eq: orderEqMock }) }
        }
        return {}
      })

      await deleteOrder('order-1')

      expect(itemsEqMock).toHaveBeenCalledWith('order_id', 'order-1')
      expect(orderEqMock).toHaveBeenCalledWith('id', 'order-1')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/pedidos')
    })

    it('lanca erro quando delete de itens falha', async () => {
      const dbError = { message: 'DB error' }
      mockFrom.mockImplementation((table: string) => {
        if (table === 'order_items') {
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: dbError }),
            }),
          }
        }
        return {}
      })

      await expect(deleteOrder('order-1')).rejects.toEqual(dbError)
    })
  })

  describe('getOrders', () => {
    it('retorna lista de pedidos com join de clientes', async () => {
      const orders = [{ id: '1', customers: { name: 'Maria' } }]
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: orders, error: null }),
        }),
      })

      const result = await getOrders()
      expect(mockFrom).toHaveBeenCalledWith('orders')
      expect(result).toEqual(orders)
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: dbError }),
        }),
      })

      await expect(getOrders()).rejects.toEqual(dbError)
    })
  })

  describe('getOrderDetails', () => {
    it('retorna detalhes do pedido', async () => {
      const order = { id: '1', customers: { name: 'Maria' }, order_items: [] }
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: order, error: null }),
          }),
        }),
      })

      const result = await getOrderDetails('1')
      expect(result).toEqual(order)
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: dbError }),
          }),
        }),
      })

      await expect(getOrderDetails('1')).rejects.toEqual(dbError)
    })
  })
})
