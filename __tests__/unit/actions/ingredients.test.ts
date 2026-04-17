import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/headers', () => ({ cookies: vi.fn().mockResolvedValue({}) }))

const mockFrom = vi.fn()
const mockSupabase = { from: mockFrom }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

vi.mock('@/lib/supabase/tenant', () => ({ getTenantId: vi.fn().mockResolvedValue('test-tenant-id') }))

import { createIngredient, updateIngredient, deleteIngredient } from '@/app/actions/ingredients'
import { revalidatePath } from 'next/cache'

const validIngredientData = {
  name: 'Farinha de Trigo',
  unit: 'kg',
  quantity: 1,
  price_for_quantity: 5.50,
  current_stock: 20,
  min_stock: 5,
  category: 'Farinhas',
}

describe('ingredients actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createIngredient', () => {
    it('insere ingrediente com dados validos', async () => {
      const insertMock = vi.fn().mockResolvedValue({ data: null, error: null })
      mockFrom.mockReturnValue({ insert: insertMock })

      await createIngredient(validIngredientData)

      expect(mockFrom).toHaveBeenCalledWith('ingredients')
      expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
        name: validIngredientData.name,
        unit: validIngredientData.unit,
        quantity: validIngredientData.quantity,
        price_for_quantity: validIngredientData.price_for_quantity,
        unit_cost: validIngredientData.price_for_quantity / validIngredientData.quantity,
        tenant_id: 'test-tenant-id',
      }))
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/ingredientes')
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      const insertMock = vi.fn().mockResolvedValue({ data: null, error: dbError })
      mockFrom.mockReturnValue({ insert: insertMock })

      await expect(createIngredient(validIngredientData)).rejects.toEqual(dbError)
    })
  })

  describe('updateIngredient', () => {
    it('atualiza ingrediente com dados validos', async () => {
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      mockFrom.mockReturnValue({ update: updateMock })

      await updateIngredient(1, validIngredientData)

      expect(mockFrom).toHaveBeenCalledWith('ingredients')
      expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
        name: validIngredientData.name,
        unit_cost: validIngredientData.price_for_quantity / validIngredientData.quantity,
      }))
      expect(eqIdMock).toHaveBeenCalledWith('id', 1)
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/ingredientes')
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: dbError })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      mockFrom.mockReturnValue({ update: updateMock })

      await expect(updateIngredient(1, validIngredientData)).rejects.toEqual(dbError)
    })
  })

  describe('deleteIngredient', () => {
    it('deleta ingrediente por id', async () => {
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const deleteMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      mockFrom.mockReturnValue({ delete: deleteMock })

      await deleteIngredient(1)

      expect(mockFrom).toHaveBeenCalledWith('ingredients')
      expect(eqIdMock).toHaveBeenCalledWith('id', 1)
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/ingredientes')
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: dbError })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const deleteMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      mockFrom.mockReturnValue({ delete: deleteMock })

      await expect(deleteIngredient(1)).rejects.toEqual(dbError)
    })
  })
})
