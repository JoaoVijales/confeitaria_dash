import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/headers', () => ({ cookies: vi.fn().mockResolvedValue({}) }))

const { mockGetFirebaseSession, mockFrom } = vi.hoisted(() => ({
  mockGetFirebaseSession: vi.fn(),
  mockFrom: vi.fn(),
}))

vi.mock('@/lib/firebase/session', () => ({
  getFirebaseSession: mockGetFirebaseSession,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
}))

import { getTenantId } from '@/lib/supabase/tenant'

describe('getTenantId', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna tenant_id quando usuário autenticado tem tenant', async () => {
    const uid = 'user-abc-123'
    const tenantId = 'tenant-xyz-456'
    mockGetFirebaseSession.mockResolvedValue({ uid, email: 'test@example.com' })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: tenantId }, error: null }),
        }),
      }),
    })

    const result = await getTenantId()

    expect(result).toBe(tenantId)
    expect(mockFrom).toHaveBeenCalledWith('tenants')
  })

  it('lança erro quando usuário não está autenticado (sem sessão)', async () => {
    mockGetFirebaseSession.mockResolvedValue(null)

    await expect(getTenantId()).rejects.toThrow('Usuário não autenticado')
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('lança erro quando sessão Firebase retorna erro', async () => {
    mockGetFirebaseSession.mockResolvedValue(null)

    await expect(getTenantId()).rejects.toThrow('Usuário não autenticado')
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('lança erro quando usuário autenticado não possui tenant cadastrado', async () => {
    mockGetFirebaseSession.mockResolvedValue({ uid: 'user-sem-tenant' })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
        }),
      }),
    })

    await expect(getTenantId()).rejects.toThrow('Tenant não encontrado')
  })

  it('lança erro genérico do banco ao buscar tenant', async () => {
    mockGetFirebaseSession.mockResolvedValue({ uid: 'user-db-error' })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
        }),
      }),
    })

    await expect(getTenantId()).rejects.toThrow('Tenant não encontrado')
  })

  it('busca tenant na tabela correta usando owner_uid do usuário', async () => {
    const uid = 'user-check-query'
    const tenantId = 'tenant-for-query-check'
    mockGetFirebaseSession.mockResolvedValue({ uid })

    const eqMock = vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: { id: tenantId }, error: null }),
    })
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
    mockFrom.mockReturnValue({ select: selectMock })

    await getTenantId()

    expect(mockFrom).toHaveBeenCalledWith('tenants')
    expect(selectMock).toHaveBeenCalledWith('id')
    expect(eqMock).toHaveBeenCalledWith('owner_uid', uid)
  })
})
