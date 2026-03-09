import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/headers', () => ({ cookies: vi.fn().mockResolvedValue({}) }))

const mockFrom = vi.fn()
const mockSupabase = { from: mockFrom }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

vi.mock('@/lib/supabase/tenant', () => ({
  getTenantId: vi.fn().mockResolvedValue('test-tenant-id'),
}))

import { createCustomer, updateCustomer, deleteCustomer, getCustomers } from '@/app/actions/customers'
import { revalidatePath } from 'next/cache'

function makeFormData(data: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(data)) fd.append(k, v)
  return fd
}

const validCustomerData = {
  name: 'Maria Silva',
  email: 'maria@example.com',
  phone: '11999999999',
  is_vip: 'on',
}

describe('customers actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCustomers', () => {
    it('retorna lista de clientes', async () => {
      const customers = [{ id: '1', name: 'Maria' }]
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: customers, error: null }),
          }),
        }),
      })

      const result = await getCustomers()
      expect(mockFrom).toHaveBeenCalledWith('customers')
      expect(result).toEqual(customers)
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

      await expect(getCustomers()).rejects.toEqual(dbError)
    })
  })

  describe('createCustomer', () => {
    it('insere cliente com dados validos', async () => {
      const insertMock = vi.fn().mockResolvedValue({ data: null, error: null })
      mockFrom.mockReturnValue({ insert: insertMock })

      await createCustomer(makeFormData(validCustomerData))

      expect(mockFrom).toHaveBeenCalledWith('customers')
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Maria Silva',
          email: 'maria@example.com',
          phone: '11999999999',
          is_vip: true,
        })
      )
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/clientes')
    })

    it('lanca erro com dados invalidos (nome curto)', async () => {
      const insertMock = vi.fn()
      mockFrom.mockReturnValue({ insert: insertMock })

      const fd = makeFormData({ ...validCustomerData, name: 'ab' })
      await expect(createCustomer(fd)).rejects.toThrow()
      expect(insertMock).not.toHaveBeenCalled()
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      const insertMock = vi.fn().mockResolvedValue({ data: null, error: dbError })
      mockFrom.mockReturnValue({ insert: insertMock })

      await expect(createCustomer(makeFormData(validCustomerData))).rejects.toEqual(dbError)
    })
  })

  describe('updateCustomer', () => {
    it('atualiza cliente com dados validos', async () => {
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      mockFrom.mockReturnValue({ update: updateMock })

      await updateCustomer('123', makeFormData(validCustomerData))

      expect(mockFrom).toHaveBeenCalledWith('customers')
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Maria Silva',
          email: 'maria@example.com',
          phone: '11999999999',
          is_vip: true,
        })
      )
      expect(eqIdMock).toHaveBeenCalledWith('id', '123')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/clientes')
    })

    it('lanca erro com dados invalidos', async () => {
      const updateMock = vi.fn()
      mockFrom.mockReturnValue({ update: updateMock })

      const fd = makeFormData({ ...validCustomerData, email: 'invalid' })
      await expect(updateCustomer('123', fd)).rejects.toThrow()
      expect(updateMock).not.toHaveBeenCalled()
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: dbError })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      mockFrom.mockReturnValue({ update: updateMock })

      await expect(updateCustomer('123', makeFormData(validCustomerData))).rejects.toEqual(dbError)
    })
  })

  describe('deleteCustomer', () => {
    it('deleta cliente por id', async () => {
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const deleteMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      mockFrom.mockReturnValue({ delete: deleteMock })

      await deleteCustomer('123')

      expect(mockFrom).toHaveBeenCalledWith('customers')
      expect(eqIdMock).toHaveBeenCalledWith('id', '123')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/clientes')
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: dbError })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const deleteMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      mockFrom.mockReturnValue({ delete: deleteMock })

      await expect(deleteCustomer('123')).rejects.toEqual(dbError)
    })
  })
})
