import { describe, it, expect } from 'vitest'
import { getPlanLimits, isAtProductLimit, isAtOrderLimit, PLANS } from '@/lib/utils/plan-limits'

describe('getPlanLimits', () => {
  it('retorna limites do plano gratuito', () => {
    const limits = getPlanLimits('free')
    expect(limits.maxProducts).toBe(30)
    expect(limits.maxOrdersPerMonth).toBe(50)
    expect(limits.name).toBe('Gratuito')
  })

  it('retorna limites do plano básico', () => {
    const limits = getPlanLimits('basic')
    expect(limits.maxProducts).toBe(200)
    expect(limits.maxOrdersPerMonth).toBe(Infinity)
    expect(limits.name).toBe('Básico')
  })

  it('retorna limites do plano pro (ilimitado)', () => {
    const limits = getPlanLimits('pro')
    expect(limits.maxProducts).toBe(Infinity)
    expect(limits.maxOrdersPerMonth).toBe(Infinity)
    expect(limits.name).toBe('Pro')
  })

  it('plano desconhecido retorna limites do plano gratuito como fallback', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const limits = getPlanLimits('unknown' as any)
    expect(limits).toEqual(PLANS.free)
  })
})

describe('isAtProductLimit', () => {
  it('retorna false quando abaixo do limite', () => {
    expect(isAtProductLimit('free', 29)).toBe(false)
    expect(isAtProductLimit('basic', 199)).toBe(false)
  })

  it('retorna true quando no limite', () => {
    expect(isAtProductLimit('free', 30)).toBe(true)
    expect(isAtProductLimit('basic', 200)).toBe(true)
  })

  it('retorna true quando acima do limite', () => {
    expect(isAtProductLimit('free', 35)).toBe(true)
  })

  it('plano pro nunca atinge o limite', () => {
    expect(isAtProductLimit('pro', 10000)).toBe(false)
  })
})

describe('isAtOrderLimit', () => {
  it('retorna false quando abaixo do limite mensal', () => {
    expect(isAtOrderLimit('free', 49)).toBe(false)
  })

  it('retorna true quando no limite mensal', () => {
    expect(isAtOrderLimit('free', 50)).toBe(true)
  })

  it('planos básico e pro nunca atingem limite de pedidos', () => {
    expect(isAtOrderLimit('basic', 100000)).toBe(false)
    expect(isAtOrderLimit('pro', 100000)).toBe(false)
  })
})
