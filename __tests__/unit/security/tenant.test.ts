import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock do Supabase server — deve vir antes dos imports de actions
vi.mock('next/headers', () => ({ cookies: vi.fn().mockResolvedValue({}) }))

const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockSupabase = {
  auth: { getUser: mockGetUser },
  from: mockFrom,
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

import { getTenantId } from '@/lib/supabase/tenant'

describe('getTenantId', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna tenant_id quando usuário autenticado tem tenant', async () => {
    const userId = 'user-abc-123'
    const tenantId = 'tenant-xyz-456'

    mockGetUser.mockResolvedValue({ data: { user: { id: userId } }, error: null })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: tenantId }, error: null }),
        }),
      }),
    })

    const result = await getTenantId(mockSupabase as never)

    expect(result).toBe(tenantId)
    expect(mockFrom).toHaveBeenCalledWith('tenants')
  })

  it('lança erro quando usuário não está autenticado (sem sessão)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    await expect(getTenantId(mockSupabase as never)).rejects.toThrow('Usuário não autenticado')
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('lança erro quando getUser retorna erro de autenticação', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'JWT expired' },
    })

    await expect(getTenantId(mockSupabase as never)).rejects.toThrow('Usuário não autenticado')
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('lança erro quando usuário autenticado não possui tenant cadastrado', async () => {
    const userId = 'user-sem-tenant'

    mockGetUser.mockResolvedValue({ data: { user: { id: userId } }, error: null })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
        }),
      }),
    })

    await expect(getTenantId(mockSupabase as never)).rejects.toThrow('Tenant não encontrado')
  })

  it('lança erro genérico do banco ao buscar tenant', async () => {
    const userId = 'user-db-error'
    mockGetUser.mockResolvedValue({ data: { user: { id: userId } }, error: null })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
        }),
      }),
    })

    await expect(getTenantId(mockSupabase as never)).rejects.toThrow('Tenant não encontrado')
  })

  it('busca tenant na tabela correta usando owner_uid do usuário', async () => {
    const userId = 'user-check-query'
    const tenantId = 'tenant-for-query-check'

    mockGetUser.mockResolvedValue({ data: { user: { id: userId } }, error: null })

    const eqMock = vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: { id: tenantId }, error: null }),
    })
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
    mockFrom.mockReturnValue({ select: selectMock })

    await getTenantId(mockSupabase as never)

    expect(mockFrom).toHaveBeenCalledWith('tenants')
    expect(selectMock).toHaveBeenCalledWith('id')
    expect(eqMock).toHaveBeenCalledWith('owner_uid', userId)
  })
})
