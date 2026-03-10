import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockVerifySessionCookie, mockCookieGet } = vi.hoisted(() => ({
  mockVerifySessionCookie: vi.fn(),
  mockCookieGet: vi.fn(),
}))

vi.mock('@/lib/firebase/admin', () => ({
  adminAuth: { verifySessionCookie: mockVerifySessionCookie },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: mockCookieGet }),
}))

import { getFirebaseSession } from '@/lib/firebase/session'

describe('getFirebaseSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna null quando não há cookie de sessão', async () => {
    mockCookieGet.mockReturnValue(undefined)
    const result = await getFirebaseSession()
    expect(result).toBeNull()
    expect(mockVerifySessionCookie).not.toHaveBeenCalled()
  })

  it('retorna sessão com uid e email quando cookie válido', async () => {
    mockCookieGet.mockReturnValue({ value: 'valid-session-cookie' })
    mockVerifySessionCookie.mockResolvedValue({ uid: 'user-123', email: 'test@example.com' })
    const result = await getFirebaseSession()
    expect(result).toEqual({ uid: 'user-123', email: 'test@example.com' })
    expect(mockVerifySessionCookie).toHaveBeenCalledWith('valid-session-cookie', true)
  })

  it('retorna sessão com uid sem email quando email não presente', async () => {
    mockCookieGet.mockReturnValue({ value: 'valid-session-cookie' })
    mockVerifySessionCookie.mockResolvedValue({ uid: 'user-456' })
    const result = await getFirebaseSession()
    expect(result).toEqual({ uid: 'user-456', email: undefined })
  })

  it('retorna null quando cookie inválido (erro de verificação)', async () => {
    mockCookieGet.mockReturnValue({ value: 'invalid-cookie' })
    mockVerifySessionCookie.mockRejectedValue(new Error('Firebase ID token has expired'))
    const result = await getFirebaseSession()
    expect(result).toBeNull()
  })

  it('retorna null quando cookie revogado', async () => {
    mockCookieGet.mockReturnValue({ value: 'revoked-cookie' })
    mockVerifySessionCookie.mockRejectedValue(new Error('Session cookie was revoked'))
    const result = await getFirebaseSession()
    expect(result).toBeNull()
  })
})
