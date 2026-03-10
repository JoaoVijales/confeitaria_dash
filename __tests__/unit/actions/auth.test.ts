import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

const {
  mockCreateSessionCookie,
  mockGetFirebaseSession,
  mockCookiesSet,
  mockCookiesDelete,
  mockFrom,
} = vi.hoisted(() => ({
  mockCreateSessionCookie: vi.fn(),
  mockGetFirebaseSession: vi.fn(),
  mockCookiesSet: vi.fn(),
  mockCookiesDelete: vi.fn(),
  mockFrom: vi.fn(),
}))

vi.mock('@/lib/firebase/admin', () => ({
  adminAuth: { createSessionCookie: mockCreateSessionCookie },
}))

vi.mock('@/lib/firebase/session', () => ({
  getFirebaseSession: mockGetFirebaseSession,
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    set: mockCookiesSet,
    delete: mockCookiesDelete,
  }),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
}))

import { createSession, signOut, createTenant, checkOnboarding } from '@/app/actions/auth'
import { redirect } from 'next/navigation'

describe('auth actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createSession', () => {
    it('cria session cookie com ID token válido', async () => {
      mockCreateSessionCookie.mockResolvedValue('firebase-session-cookie-value')

      await createSession('valid-id-token')

      expect(mockCreateSessionCookie).toHaveBeenCalledWith(
        'valid-id-token',
        expect.objectContaining({ expiresIn: expect.any(Number) })
      )
      expect(mockCookiesSet).toHaveBeenCalledWith(
        '__session',
        'firebase-session-cookie-value',
        expect.objectContaining({ httpOnly: true, path: '/' })
      )
    })

    it('lança erro quando ID token inválido', async () => {
      mockCreateSessionCookie.mockRejectedValue(new Error('INVALID_ID_TOKEN'))

      await expect(createSession('invalid-token')).rejects.toThrow('INVALID_ID_TOKEN')
      expect(mockCookiesSet).not.toHaveBeenCalled()
    })
  })

  describe('signOut', () => {
    it('limpa cookie de sessão e redireciona para /login', async () => {
      await signOut()

      expect(mockCookiesDelete).toHaveBeenCalledWith('__session')
      expect(redirect).toHaveBeenCalledWith('/login')
    })
  })

  describe('createTenant', () => {
    it('cria tenant quando usuário autenticado e sem tenant existente', async () => {
      mockGetFirebaseSession.mockResolvedValue({ uid: 'user-123', email: 'test@example.com' })

      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
          }),
        }),
      })

      const newTenantId = 'new-tenant-id'
      mockFrom.mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: newTenantId }, error: null }),
          }),
        }),
      })

      const result = await createTenant('Minha Confeitaria')

      expect(result).toBe(newTenantId)
    })

    it('retorna tenant existente sem criar novo', async () => {
      mockGetFirebaseSession.mockResolvedValue({ uid: 'user-123' })

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: 'existing-tenant' }, error: null }),
          }),
        }),
      })

      const result = await createTenant('Confeitaria')

      expect(result).toBe('existing-tenant')
    })

    it('lança erro quando usuário não autenticado', async () => {
      mockGetFirebaseSession.mockResolvedValue(null)

      await expect(createTenant('Confeitaria')).rejects.toThrow('Usuário não autenticado')
      expect(mockFrom).not.toHaveBeenCalled()
    })

    it('lança erro quando falha ao inserir tenant no banco', async () => {
      mockGetFirebaseSession.mockResolvedValue({ uid: 'user-123' })

      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
          }),
        }),
      })

      mockFrom.mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
          }),
        }),
      })

      await expect(createTenant('Confeitaria')).rejects.toThrow('Erro ao criar tenant')
    })
  })

  describe('checkOnboarding', () => {
    it('retorna true quando tenant existe para o usuário', async () => {
      mockGetFirebaseSession.mockResolvedValue({ uid: 'user-123' })
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: 'tenant-id' }, error: null }),
          }),
        }),
      })

      const result = await checkOnboarding()

      expect(result).toBe(true)
    })

    it('retorna false quando não há sessão', async () => {
      mockGetFirebaseSession.mockResolvedValue(null)

      const result = await checkOnboarding()

      expect(result).toBe(false)
      expect(mockFrom).not.toHaveBeenCalled()
    })

    it('retorna false quando tenant não existe', async () => {
      mockGetFirebaseSession.mockResolvedValue({ uid: 'user-no-tenant' })
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
          }),
        }),
      })

      const result = await checkOnboarding()

      expect(result).toBe(false)
    })
  })
})
