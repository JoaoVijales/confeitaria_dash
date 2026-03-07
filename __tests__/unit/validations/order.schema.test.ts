import { describe, it, expect } from 'vitest'
import { orderSchema } from '@/lib/validations/order.schema'

const validOrder = {
  customer_id: '550e8400-e29b-41d4-a716-446655440000',
  items: [
    { product_id: 'prod-1', quantity: 2, unit_price: 25.0 },
  ],
  total: 50.0,
  status: 'Pendente' as const,
}

describe('orderSchema', () => {
  it('deve aceitar dados validos', () => {
    const result = orderSchema.safeParse(validOrder)
    expect(result.success).toBe(true)
  })

  it('deve aceitar pedido com multiplos itens', () => {
    const result = orderSchema.safeParse({
      ...validOrder,
      items: [
        { product_id: 'prod-1', quantity: 2, unit_price: 25.0 },
        { product_id: 'prod-2', quantity: 1, unit_price: 30.0 },
      ],
    })
    expect(result.success).toBe(true)
  })

  // customer_id
  it('deve rejeitar quando customer_id esta faltando', () => {
    const { customer_id, ...rest } = validOrder
    const result = orderSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('deve rejeitar customer_id que nao e UUID', () => {
    const result = orderSchema.safeParse({ ...validOrder, customer_id: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  // items
  it('deve rejeitar quando items esta faltando', () => {
    const { items, ...rest } = validOrder
    const result = orderSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('deve rejeitar items como array vazio', () => {
    const result = orderSchema.safeParse({ ...validOrder, items: [] })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar item com quantity menor que 1', () => {
    const result = orderSchema.safeParse({
      ...validOrder,
      items: [{ product_id: 'prod-1', quantity: 0, unit_price: 25.0 }],
    })
    expect(result.success).toBe(false)
  })

  it('deve aceitar item com quantity igual a 1', () => {
    const result = orderSchema.safeParse({
      ...validOrder,
      items: [{ product_id: 'prod-1', quantity: 1, unit_price: 25.0 }],
    })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar item sem product_id', () => {
    const result = orderSchema.safeParse({
      ...validOrder,
      items: [{ quantity: 2, unit_price: 25.0 }],
    })
    expect(result.success).toBe(false)
  })

  // total
  it('deve rejeitar quando total esta faltando', () => {
    const { total, ...rest } = validOrder
    const result = orderSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('deve rejeitar total negativo', () => {
    const result = orderSchema.safeParse({ ...validOrder, total: -1 })
    expect(result.success).toBe(false)
  })

  it('deve aceitar total igual a 0', () => {
    const result = orderSchema.safeParse({ ...validOrder, total: 0 })
    expect(result.success).toBe(true)
  })

  // status
  it('deve rejeitar quando status esta faltando', () => {
    const { status, ...rest } = validOrder
    const result = orderSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('deve aceitar todos os status validos', () => {
    const statuses = ['Pendente', 'Em Preparo', 'Pronto para Retirada', 'Finalizado', 'Cancelado']
    for (const status of statuses) {
      const result = orderSchema.safeParse({ ...validOrder, status })
      expect(result.success).toBe(true)
    }
  })

  it('deve rejeitar status invalido', () => {
    const result = orderSchema.safeParse({ ...validOrder, status: 'Entregue' })
    expect(result.success).toBe(false)
  })
})
