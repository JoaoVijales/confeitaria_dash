import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/headers', () => ({ cookies: vi.fn().mockResolvedValue({}) }))

const mockFrom = vi.fn()
const mockSupabase = { from: mockFrom }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

vi.mock('@/lib/supabase/tenant', () => ({ getTenantId: vi.fn().mockResolvedValue('test-tenant-id') }))

import { createExpense, updateExpense, deleteExpense, getExpenses } from '@/app/actions/expenses'
import { revalidatePath } from 'next/cache'

function makeFormData(data: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(data)) fd.append(k, v)
  return fd
}

const validExpenseData = {
  date: '2024-01-15',
  description: 'Compra de farinha',
  category: 'Ingredientes',
  quantity: '10',
  unit_price: '5.00',
  total: '50.00',
}

describe('expenses actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getExpenses', () => {
    it('retorna lista de despesas', async () => {
      const expenses = [{ id: '1', description: 'Farinha' }]
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: expenses, error: null }),
          }),
        }),
      })

      const result = await getExpenses()
      expect(mockFrom).toHaveBeenCalledWith('expense_entries')
      expect(result).toEqual(expenses)
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

      await expect(getExpenses()).rejects.toEqual(dbError)
    })
  })

  describe('createExpense', () => {
    it('insere despesa com dados validos', async () => {
      const insertMock = vi.fn().mockResolvedValue({ data: null, error: null })
      mockFrom.mockReturnValue({ insert: insertMock })

      await createExpense(makeFormData(validExpenseData))

      expect(mockFrom).toHaveBeenCalledWith('expense_entries')
      expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
        date: '2024-01-15',
        description: 'Compra de farinha',
        category: 'Ingredientes',
        quantity: 10,
        unit_price: 5,
        total: 50,
      }))
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/saidas')
    })

    it('lanca erro com dados invalidos (descricao vazia)', async () => {
      const insertMock = vi.fn()
      mockFrom.mockReturnValue({ insert: insertMock })

      const fd = makeFormData({ ...validExpenseData, description: '' })
      await expect(createExpense(fd)).rejects.toThrow()
      expect(insertMock).not.toHaveBeenCalled()
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      const insertMock = vi.fn().mockResolvedValue({ data: null, error: dbError })
      mockFrom.mockReturnValue({ insert: insertMock })

      await expect(createExpense(makeFormData(validExpenseData))).rejects.toEqual(dbError)
    })
  })

  describe('updateExpense', () => {
    it('atualiza despesa com dados validos', async () => {
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      mockFrom.mockReturnValue({ update: updateMock })

      await updateExpense('123', makeFormData(validExpenseData))

      expect(mockFrom).toHaveBeenCalledWith('expense_entries')
      expect(eqIdMock).toHaveBeenCalledWith('id', '123')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/saidas')
    })

    it('lanca erro com dados invalidos', async () => {
      const updateMock = vi.fn()
      mockFrom.mockReturnValue({ update: updateMock })

      const fd = makeFormData({ ...validExpenseData, date: '' })
      await expect(updateExpense('123', fd)).rejects.toThrow()
      expect(updateMock).not.toHaveBeenCalled()
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: dbError })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      mockFrom.mockReturnValue({ update: updateMock })

      await expect(updateExpense('123', makeFormData(validExpenseData))).rejects.toEqual(dbError)
    })
  })

  describe('deleteExpense', () => {
    it('deleta despesa por id', async () => {
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const deleteMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      mockFrom.mockReturnValue({ delete: deleteMock })

      await deleteExpense('123')

      expect(mockFrom).toHaveBeenCalledWith('expense_entries')
      expect(eqIdMock).toHaveBeenCalledWith('id', '123')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/saidas')
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: dbError })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const deleteMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      mockFrom.mockReturnValue({ delete: deleteMock })

      await expect(deleteExpense('123')).rejects.toEqual(dbError)
    })
  })
})
