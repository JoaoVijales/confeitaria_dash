import { describe, it, expect } from 'vitest'
import { expenseSchema } from '@/lib/validations/expense.schema'

const validExpense = {
  date: '2026-01-15',
  description: 'Compra de farinha',
  category: 'Ingredientes',
  quantity: 5,
  unit_price: 10.5,
  total: 52.5,
}

describe('expenseSchema', () => {
  it('deve aceitar dados validos', () => {
    const result = expenseSchema.safeParse(validExpense)
    expect(result.success).toBe(true)
  })

  // date
  it('deve rejeitar quando date esta faltando', () => {
    const { date, ...rest } = validExpense
    const result = expenseSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('deve rejeitar date vazia', () => {
    const result = expenseSchema.safeParse({ ...validExpense, date: '' })
    expect(result.success).toBe(false)
  })

  // description
  it('deve rejeitar quando description esta faltando', () => {
    const { description, ...rest } = validExpense
    const result = expenseSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('deve rejeitar description vazia', () => {
    const result = expenseSchema.safeParse({ ...validExpense, description: '' })
    expect(result.success).toBe(false)
  })

  // category
  it('deve rejeitar quando category esta faltando', () => {
    const { category, ...rest } = validExpense
    const result = expenseSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('deve rejeitar category vazia', () => {
    const result = expenseSchema.safeParse({ ...validExpense, category: '' })
    expect(result.success).toBe(false)
  })

  // quantity
  it('deve rejeitar quando quantity esta faltando', () => {
    const { quantity, ...rest } = validExpense
    const result = expenseSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('deve rejeitar quantity menor que 1', () => {
    const result = expenseSchema.safeParse({ ...validExpense, quantity: 0 })
    expect(result.success).toBe(false)
  })

  it('deve aceitar quantity igual a 1', () => {
    const result = expenseSchema.safeParse({ ...validExpense, quantity: 1 })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar quantity com tipo errado', () => {
    const result = expenseSchema.safeParse({ ...validExpense, quantity: '5' })
    expect(result.success).toBe(false)
  })

  // unit_price
  it('deve rejeitar quando unit_price esta faltando', () => {
    const { unit_price, ...rest } = validExpense
    const result = expenseSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('deve rejeitar unit_price negativo', () => {
    const result = expenseSchema.safeParse({ ...validExpense, unit_price: -1 })
    expect(result.success).toBe(false)
  })

  it('deve aceitar unit_price igual a 0', () => {
    const result = expenseSchema.safeParse({ ...validExpense, unit_price: 0 })
    expect(result.success).toBe(true)
  })

  // total
  it('deve rejeitar quando total esta faltando', () => {
    const { total, ...rest } = validExpense
    const result = expenseSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('deve rejeitar total negativo', () => {
    const result = expenseSchema.safeParse({ ...validExpense, total: -1 })
    expect(result.success).toBe(false)
  })

  it('deve aceitar total igual a 0', () => {
    const result = expenseSchema.safeParse({ ...validExpense, total: 0 })
    expect(result.success).toBe(true)
  })
})
