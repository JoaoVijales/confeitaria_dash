import { describe, it, expect } from 'vitest'
import { ingredientPurchaseSchema } from '@/lib/validations/ingredient-purchase.schema'

const validData = {
  ingredient_id: 1,
  quantity: 10,
  unit_cost: 5.5,
  total_cost: 55,
  purchased_at: '2026-03-07',
}

describe('ingredientPurchaseSchema', () => {
  it('valida dados corretos', () => {
    const result = ingredientPurchaseSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('aceita supplier e notes opcionais', () => {
    const result = ingredientPurchaseSchema.safeParse({
      ...validData,
      supplier: 'Fornecedor X',
      notes: 'Compra emergencial',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita ingredient_id ausente', () => {
    const { ingredient_id: _ingredient_id, ...rest } = validData
    const result = ingredientPurchaseSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejeita ingredient_id negativo', () => {
    const result = ingredientPurchaseSchema.safeParse({ ...validData, ingredient_id: -1 })
    expect(result.success).toBe(false)
  })

  it('rejeita quantity zero ou negativa', () => {
    const result = ingredientPurchaseSchema.safeParse({ ...validData, quantity: 0 })
    expect(result.success).toBe(false)
  })

  it('rejeita unit_cost negativo', () => {
    const result = ingredientPurchaseSchema.safeParse({ ...validData, unit_cost: -1 })
    expect(result.success).toBe(false)
  })

  it('rejeita total_cost negativo', () => {
    const result = ingredientPurchaseSchema.safeParse({ ...validData, total_cost: -1 })
    expect(result.success).toBe(false)
  })

  it('rejeita purchased_at vazio', () => {
    const result = ingredientPurchaseSchema.safeParse({ ...validData, purchased_at: '' })
    expect(result.success).toBe(false)
  })

  it('aceita unit_cost e total_cost zero', () => {
    const result = ingredientPurchaseSchema.safeParse({ ...validData, unit_cost: 0, total_cost: 0 })
    expect(result.success).toBe(true)
  })
})
