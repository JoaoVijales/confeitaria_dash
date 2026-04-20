import { describe, it, expect } from 'vitest'
import { decodeSessionCookieExpiry } from '@/middleware'

function makeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const body = btoa(JSON.stringify(payload))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${header}.${body}.fake-signature`
}

const futureExp = Math.floor(Date.now() / 1000) + 3600
const pastExp = Math.floor(Date.now() / 1000) - 3600

describe('decodeSessionCookieExpiry', () => {
  it('retorna o timestamp de expiração de um JWT válido', () => {
    const jwt = makeJwt({ sub: 'uid-1', exp: futureExp })
    expect(decodeSessionCookieExpiry(jwt)).toBe(futureExp)
  })

  it('retorna null para string vazia', () => {
    expect(decodeSessionCookieExpiry('')).toBeNull()
  })

  it('retorna null para cookie com formato inválido (sem pontos)', () => {
    expect(decodeSessionCookieExpiry('nao-e-um-jwt')).toBeNull()
  })

  it('retorna null quando payload não tem campo exp', () => {
    const jwt = makeJwt({ sub: 'uid-1' })
    expect(decodeSessionCookieExpiry(jwt)).toBeNull()
  })

  it('retorna null quando payload não é JSON válido', () => {
    expect(decodeSessionCookieExpiry('header.!!invalid!!.sig')).toBeNull()
  })

  it('retorna exp mesmo quando o token já expirou', () => {
    const jwt = makeJwt({ sub: 'uid-1', exp: pastExp })
    expect(decodeSessionCookieExpiry(jwt)).toBe(pastExp)
  })
})

describe('middleware auth behavior', () => {
  it('cookie válido não expirado passa na verificação de expiração', () => {
    const jwt = makeJwt({ sub: 'uid-1', exp: futureExp })
    const exp = decodeSessionCookieExpiry(jwt)
    expect(exp).not.toBeNull()
    expect(Date.now() / 1000 < exp!).toBe(true)
  })

  it('cookie expirado falha na verificação', () => {
    const jwt = makeJwt({ sub: 'uid-1', exp: pastExp })
    const exp = decodeSessionCookieExpiry(jwt)
    expect(exp).not.toBeNull()
    expect(Date.now() / 1000 < exp!).toBe(false)
  })
})
