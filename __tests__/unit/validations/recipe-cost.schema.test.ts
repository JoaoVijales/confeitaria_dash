import { describe, it, expect } from 'vitest'
import { recipeCostSchema } from '@/lib/validations/recipe-cost.schema'

const validDataPercent = {
  margin_type: 'percent',
  margin_value: 30,
  portions: 12,
}

const validDataFixed = {
  margin_type: 'fixed',
  margin_value: 5.0,
  portions: 6,
}

describe('recipeCostSchema', () => {
  it('valida dados corretos com tipo percentual', () => {
    const result = recipeCostSchema.safeParse(validDataPercent)
    expect(result.success).toBe(true)
  })

  it('valida dados corretos com tipo fixo', () => {
    const result = recipeCostSchema.safeParse(validDataFixed)
    expect(result.success).toBe(true)
  })

  it('aceita margin_value igual a zero', () => {
    const result = recipeCostSchema.safeParse({ ...validDataPercent, margin_value: 0 })
    expect(result.success).toBe(true)
  })

  it('rejeita margin_value negativo', () => {
    const result = recipeCostSchema.safeParse({ ...validDataPercent, margin_value: -1 })
    expect(result.success).toBe(false)
  })

  it('rejeita margin_type ausente', () => {
    const { margin_type, ...rest } = validDataPercent
    const result = recipeCostSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejeita margin_type invalido (valor fora do enum)', () => {
    const result = recipeCostSchema.safeParse({ ...validDataPercent, margin_type: 'multiplicador' })
    expect(result.success).toBe(false)
  })

  it('rejeita portions igual a zero', () => {
    const result = recipeCostSchema.safeParse({ ...validDataPercent, portions: 0 })
    expect(result.success).toBe(false)
  })

  it('rejeita portions negativo', () => {
    const result = recipeCostSchema.safeParse({ ...validDataPercent, portions: -5 })
    expect(result.success).toBe(false)
  })

  it('rejeita portions ausente', () => {
    const { portions, ...rest } = validDataPercent
    const result = recipeCostSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejeita margin_value ausente', () => {
    const { margin_value, ...rest } = validDataPercent
    const result = recipeCostSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejeita margin_value igual a 100 quando margin_type e percent', () => {
    const result = recipeCostSchema.safeParse({ ...validDataPercent, margin_value: 100 })
    expect(result.success).toBe(false)
  })

  it('rejeita margin_value maior que 100 quando margin_type e percent', () => {
    const result = recipeCostSchema.safeParse({ ...validDataPercent, margin_value: 150 })
    expect(result.success).toBe(false)
  })

  it('aceita margin_value igual a 99.99 quando margin_type e percent', () => {
    const result = recipeCostSchema.safeParse({ ...validDataPercent, margin_value: 99.99 })
    expect(result.success).toBe(true)
  })

  it('aceita margin_value qualquer quando margin_type e fixed', () => {
    const result = recipeCostSchema.safeParse({ ...validDataFixed, margin_value: 1000 })
    expect(result.success).toBe(true)
  })
})
