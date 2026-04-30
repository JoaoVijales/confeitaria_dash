import { describe, it, expect } from 'vitest'
import { getPlanLimits, isAtProductLimit, isAtOrderLimit, PLANS } from '@/lib/utils/plan-limits'

describe('getPlanLimits', () => {
  it('plano free retorna limites bloqueados (estado interno)', () => {
    const limits = getPlanLimits('free')
    expect(limits.maxProducts).toBe(0)
    expect(limits.maxOrdersPerMonth).toBe(0)
    expect(limits.name).toBe('Sem plano ativo')
  })

  it('retorna limites do plano básico', () => {
    const limits = getPlanLimits('basic')
    expect(limits.maxProducts).toBe(10)
    expect(limits.maxOrdersPerMonth).toBe(Infinity)
    expect(limits.name).toBe('Básico')
  })

  it('retorna limites do plano pro', () => {
    const limits = getPlanLimits('pro')
    expect(limits.maxProducts).toBe(50)
    expect(limits.maxOrdersPerMonth).toBe(Infinity)
    expect(limits.name).toBe('Pro')
  })

  it('retorna limites ilimitados para o plano max', () => {
    const limits = getPlanLimits('max')
    expect(limits.maxProducts).toBe(Infinity)
    expect(limits.maxOrdersPerMonth).toBe(Infinity)
    expect(limits.name).toBe('Max')
  })

  it('plano desconhecido retorna limites do plano free como fallback', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const limits = getPlanLimits('unknown' as any)
    expect(limits).toEqual(PLANS.free)
  })
})

describe('isAtProductLimit', () => {
  it('retorna false quando abaixo do limite', () => {
    expect(isAtProductLimit('basic', 9)).toBe(false)
    expect(isAtProductLimit('pro', 49)).toBe(false)
  })

  it('retorna true quando no limite', () => {
    expect(isAtProductLimit('basic', 10)).toBe(true)
    expect(isAtProductLimit('pro', 50)).toBe(true)
  })

  it('retorna true quando acima do limite', () => {
    expect(isAtProductLimit('basic', 15)).toBe(true)
    expect(isAtProductLimit('pro', 55)).toBe(true)
  })

  it('plano max nunca atinge o limite de produtos', () => {
    expect(isAtProductLimit('max', 100000)).toBe(false)
  })

  it('plano free sempre está no limite (bloqueado)', () => {
    expect(isAtProductLimit('free', 0)).toBe(true)
  })
})

describe('isAtOrderLimit', () => {
  it('planos básico, pro e max nunca atingem limite de pedidos', () => {
    expect(isAtOrderLimit('basic', 100000)).toBe(false)
    expect(isAtOrderLimit('pro', 100000)).toBe(false)
    expect(isAtOrderLimit('max', 100000)).toBe(false)
  })

  it('plano free sempre está no limite de pedidos (bloqueado)', () => {
    expect(isAtOrderLimit('free', 0)).toBe(true)
  })
})
