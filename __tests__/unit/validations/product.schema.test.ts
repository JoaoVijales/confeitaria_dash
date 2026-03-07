import { describe, it, expect } from 'vitest'
import { productSchema } from '@/lib/validations/product.schema'

const validProduct = {
  name: 'Bolo de Chocolate',
  category: 'Bolos',
  price: 45.0,
  cost: 20.0,
  stock: 10,
  min_stock: 2,
}

describe('productSchema', () => {
  it('deve aceitar dados validos', () => {
    const result = productSchema.safeParse(validProduct)
    expect(result.success).toBe(true)
  })

  // name
  it('deve rejeitar quando nome esta faltando', () => {
    const { name, ...rest } = validProduct
    const result = productSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('deve rejeitar nome com menos de 3 caracteres', () => {
    const result = productSchema.safeParse({ ...validProduct, name: 'Bo' })
    expect(result.success).toBe(false)
  })

  it('deve aceitar nome com exatamente 3 caracteres', () => {
    const result = productSchema.safeParse({ ...validProduct, name: 'Pao' })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar nome com tipo errado', () => {
    const result = productSchema.safeParse({ ...validProduct, name: 123 })
    expect(result.success).toBe(false)
  })

  // category
  it('deve rejeitar quando category esta faltando', () => {
    const { category, ...rest } = validProduct
    const result = productSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('deve rejeitar category com menos de 3 caracteres', () => {
    const result = productSchema.safeParse({ ...validProduct, category: 'AB' })
    expect(result.success).toBe(false)
  })

  it('deve aceitar category com exatamente 3 caracteres', () => {
    const result = productSchema.safeParse({ ...validProduct, category: 'Pao' })
    expect(result.success).toBe(true)
  })

  // price
  it('deve rejeitar quando price esta faltando', () => {
    const { price, ...rest } = validProduct
    const result = productSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('deve rejeitar price negativo', () => {
    const result = productSchema.safeParse({ ...validProduct, price: -1 })
    expect(result.success).toBe(false)
  })

  it('deve aceitar price igual a 0', () => {
    const result = productSchema.safeParse({ ...validProduct, price: 0 })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar price com tipo errado', () => {
    const result = productSchema.safeParse({ ...validProduct, price: '45' })
    expect(result.success).toBe(false)
  })

  // cost
  it('deve rejeitar quando cost esta faltando', () => {
    const { cost, ...rest } = validProduct
    const result = productSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('deve rejeitar cost negativo', () => {
    const result = productSchema.safeParse({ ...validProduct, cost: -1 })
    expect(result.success).toBe(false)
  })

  it('deve aceitar cost igual a 0', () => {
    const result = productSchema.safeParse({ ...validProduct, cost: 0 })
    expect(result.success).toBe(true)
  })

  // stock
  it('deve rejeitar quando stock esta faltando', () => {
    const { stock, ...rest } = validProduct
    const result = productSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('deve rejeitar stock negativo', () => {
    const result = productSchema.safeParse({ ...validProduct, stock: -1 })
    expect(result.success).toBe(false)
  })

  it('deve aceitar stock igual a 0', () => {
    const result = productSchema.safeParse({ ...validProduct, stock: 0 })
    expect(result.success).toBe(true)
  })

  // min_stock
  it('deve rejeitar quando min_stock esta faltando', () => {
    const { min_stock, ...rest } = validProduct
    const result = productSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('deve rejeitar min_stock negativo', () => {
    const result = productSchema.safeParse({ ...validProduct, min_stock: -1 })
    expect(result.success).toBe(false)
  })

  it('deve aceitar min_stock igual a 0', () => {
    const result = productSchema.safeParse({ ...validProduct, min_stock: 0 })
    expect(result.success).toBe(true)
  })
})
