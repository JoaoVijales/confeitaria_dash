import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/headers', () => ({ cookies: vi.fn().mockResolvedValue({}) }))

const mockFrom = vi.fn()
const mockSupabase = { from: mockFrom }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

vi.mock('@/lib/supabase/tenant', () => ({ getTenantId: vi.fn().mockResolvedValue('test-tenant-id') }))

import { createRevenue, updateRevenue, deleteRevenue, getRevenues } from '@/app/actions/revenues'
import { revalidatePath } from 'next/cache'

function makeFormData(data: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(data)) fd.append(k, v)
  return fd
}

const validRevenueData = {
  date: '2024-01-15',
  description: 'Venda de bolos',
  quantity: '5',
  unit_price: '25.00',
  total: '125.00',
}

describe('revenues actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getRevenues', () => {
    it('retorna lista de receitas', async () => {
      const revenues = [{ id: '1', description: 'Venda' }]
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: revenues, error: null }),
          }),
        }),
      })

      const result = await getRevenues()
      expect(mockFrom).toHaveBeenCalledWith('revenue_entries')
      expect(result).toEqual(revenues)
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: dbError }),
          }),
        }),
      })

      await expect(getRevenues()).rejects.toEqual(dbError)
    })
  })

  describe('createRevenue', () => {
    it('insere receita com dados validos', async () => {
      const insertMock = vi.fn().mockResolvedValue({ data: null, error: null })
      mockFrom.mockReturnValue({ insert: insertMock })

      await createRevenue(makeFormData(validRevenueData))

      expect(mockFrom).toHaveBeenCalledWith('revenue_entries')
      expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
        date: '2024-01-15',
        description: 'Venda de bolos',
        quantity: 5,
        unit_price: 25,
        total: 125,
      }))
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/entradas')
    })

    it('lanca erro com dados invalidos (descricao vazia)', async () => {
      const insertMock = vi.fn()
      mockFrom.mockReturnValue({ insert: insertMock })

      const fd = makeFormData({ ...validRevenueData, description: '' })
      await expect(createRevenue(fd)).rejects.toThrow()
      expect(insertMock).not.toHaveBeenCalled()
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      const insertMock = vi.fn().mockResolvedValue({ data: null, error: dbError })
      mockFrom.mockReturnValue({ insert: insertMock })

      await expect(createRevenue(makeFormData(validRevenueData))).rejects.toEqual(dbError)
    })
  })

  describe('updateRevenue', () => {
    it('atualiza receita com dados validos', async () => {
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      mockFrom.mockReturnValue({ update: updateMock })

      await updateRevenue('123', makeFormData(validRevenueData))

      expect(mockFrom).toHaveBeenCalledWith('revenue_entries')
      expect(eqIdMock).toHaveBeenCalledWith('id', '123')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/entradas')
    })

    it('lanca erro com dados invalidos', async () => {
      const updateMock = vi.fn()
      mockFrom.mockReturnValue({ update: updateMock })

      const fd = makeFormData({ ...validRevenueData, date: '' })
      await expect(updateRevenue('123', fd)).rejects.toThrow()
      expect(updateMock).not.toHaveBeenCalled()
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: dbError })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      mockFrom.mockReturnValue({ update: updateMock })

      await expect(updateRevenue('123', makeFormData(validRevenueData))).rejects.toEqual(dbError)
    })
  })

  describe('deleteRevenue', () => {
    it('deleta receita por id', async () => {
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const deleteMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      mockFrom.mockReturnValue({ delete: deleteMock })

      await deleteRevenue('123')

      expect(mockFrom).toHaveBeenCalledWith('revenue_entries')
      expect(eqIdMock).toHaveBeenCalledWith('id', '123')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/entradas')
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: dbError })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const deleteMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      mockFrom.mockReturnValue({ delete: deleteMock })

      await expect(deleteRevenue('123')).rejects.toEqual(dbError)
    })
  })
})
