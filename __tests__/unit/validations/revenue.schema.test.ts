import { describe, it, expect } from 'vitest'
import { revenueSchema } from '@/lib/validations/revenue.schema'

const validRevenue = {
  date: '2026-01-15',
  description: 'Venda de bolos',
  quantity: 3,
  unit_price: 45.0,
  total: 135.0,
}

describe('revenueSchema', () => {
  it('deve aceitar dados validos', () => {
    const result = revenueSchema.safeParse(validRevenue)
    expect(result.success).toBe(true)
  })

  // date
  it('deve rejeitar quando date esta faltando', () => {
    const { date: _date, ...rest } = validRevenue
    const result = revenueSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('deve rejeitar date vazia', () => {
    const result = revenueSchema.safeParse({ ...validRevenue, date: '' })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar date com tipo errado', () => {
    const result = revenueSchema.safeParse({ ...validRevenue, date: 123 })
    expect(result.success).toBe(false)
  })

  // description
  it('deve rejeitar quando description esta faltando', () => {
    const { description: _description, ...rest } = validRevenue
    const result = revenueSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('deve rejeitar description vazia', () => {
    const result = revenueSchema.safeParse({ ...validRevenue, description: '' })
    expect(result.success).toBe(false)
  })

  // quantity
  it('deve rejeitar quando quantity esta faltando', () => {
    const { quantity: _quantity, ...rest } = validRevenue
    const result = revenueSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('deve rejeitar quantity menor que 1', () => {
    const result = revenueSchema.safeParse({ ...validRevenue, quantity: 0 })
    expect(result.success).toBe(false)
  })

  it('deve aceitar quantity igual a 1', () => {
    const result = revenueSchema.safeParse({ ...validRevenue, quantity: 1 })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar quantity com tipo errado', () => {
    const result = revenueSchema.safeParse({ ...validRevenue, quantity: '3' })
    expect(result.success).toBe(false)
  })

  // unit_price
  it('deve rejeitar quando unit_price esta faltando', () => {
    const { unit_price: _unit_price, ...rest } = validRevenue
    const result = revenueSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('deve rejeitar unit_price negativo', () => {
    const result = revenueSchema.safeParse({ ...validRevenue, unit_price: -1 })
    expect(result.success).toBe(false)
  })

  it('deve aceitar unit_price igual a 0', () => {
    const result = revenueSchema.safeParse({ ...validRevenue, unit_price: 0 })
    expect(result.success).toBe(true)
  })

  // total
  it('deve rejeitar quando total esta faltando', () => {
    const { total: _total, ...rest } = validRevenue
    const result = revenueSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('deve rejeitar total negativo', () => {
    const result = revenueSchema.safeParse({ ...validRevenue, total: -1 })
    expect(result.success).toBe(false)
  })

  it('deve aceitar total igual a 0', () => {
    const result = revenueSchema.safeParse({ ...validRevenue, total: 0 })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar total acima do limite maximo', () => {
    const result = revenueSchema.safeParse({ ...validRevenue, total: 10_000_001 })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar unit_price acima do limite maximo', () => {
    const result = revenueSchema.safeParse({ ...validRevenue, unit_price: 10_000_001 })
    expect(result.success).toBe(false)
  })
})
