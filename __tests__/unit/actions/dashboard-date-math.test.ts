import { describe, it, expect } from 'vitest'
import { buildMonthDateRange } from '@/lib/utils/date-range'

describe('buildMonthDateRange', () => {
  it('curMonthStart é o primeiro dia do mês atual', () => {
    const now = new Date('2026-04-15T10:00:00Z')
    const { curMonthStart } = buildMonthDateRange(now)
    expect(new Date(curMonthStart).getUTCMonth()).toBe(3) // April = 3
    expect(new Date(curMonthStart).getDate()).toBe(1)
  })

  it('curMonthEnd é o último dia do mês atual (não ultrapassa para o próximo mês)', () => {
    const now = new Date('2026-04-15T10:00:00Z')
    const { curMonthEnd } = buildMonthDateRange(now)
    const end = new Date(curMonthEnd)
    expect(end.getMonth()).toBe(3) // still April
    expect(end.getDate()).toBe(30) // April has 30 days
  })

  it('curMonthEnd em Janeiro é 31 de Janeiro', () => {
    const now = new Date('2026-01-20T10:00:00Z')
    const { curMonthEnd } = buildMonthDateRange(now)
    const end = new Date(curMonthEnd)
    expect(end.getMonth()).toBe(0) // January
    expect(end.getDate()).toBe(31)
  })

  it('prevMonthStart é o primeiro dia do mês anterior', () => {
    const now = new Date('2026-04-15T10:00:00Z')
    const { prevMonthStart } = buildMonthDateRange(now)
    const start = new Date(prevMonthStart)
    expect(start.getMonth()).toBe(2) // March
    expect(start.getDate()).toBe(1)
  })

  it('prevMonthEnd é o último dia do mês anterior', () => {
    const now = new Date('2026-04-15T10:00:00Z')
    const { prevMonthEnd } = buildMonthDateRange(now)
    const end = new Date(prevMonthEnd)
    expect(end.getMonth()).toBe(2) // March
    expect(end.getDate()).toBe(31)
  })

  it('virada de ano: Janeiro → mês anterior é Dezembro do ano anterior', () => {
    const now = new Date('2026-01-10T10:00:00Z')
    const { prevMonthStart, prevMonthEnd } = buildMonthDateRange(now)
    const start = new Date(prevMonthStart)
    const end = new Date(prevMonthEnd)
    expect(start.getFullYear()).toBe(2025)
    expect(start.getMonth()).toBe(11) // December
    expect(end.getFullYear()).toBe(2025)
    expect(end.getMonth()).toBe(11)
    expect(end.getDate()).toBe(31)
  })

  it('curMonthEnd e prevMonthEnd não se sobrepõem', () => {
    const now = new Date('2026-04-15T10:00:00Z')
    const { curMonthStart, curMonthEnd, prevMonthEnd } = buildMonthDateRange(now)
    expect(new Date(prevMonthEnd) < new Date(curMonthStart)).toBe(true)
    expect(new Date(curMonthStart) <= new Date(curMonthEnd)).toBe(true)
  })
})
