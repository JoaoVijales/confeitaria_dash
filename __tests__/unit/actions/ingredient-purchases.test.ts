import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/headers', () => ({ cookies: vi.fn().mockResolvedValue({}) }))

const mockFrom = vi.fn()
const mockSupabase = { from: mockFrom }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

vi.mock('@/lib/supabase/tenant', () => ({ getTenantId: vi.fn().mockResolvedValue('test-tenant-id') }))

import {
  createIngredientPurchase,
  getIngredientPurchases,
  deleteIngredientPurchase,
} from '@/app/actions/ingredient-purchases'
import { revalidatePath } from 'next/cache'

const validPurchaseData = {
  ingredient_id: 1,
  quantity: 10,
  unit_cost: 5.5,
  total_cost: 55,
  purchased_at: '2026-03-07',
  supplier: 'Fornecedor X',
  notes: 'Compra rotina',
}

describe('ingredient-purchases actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createIngredientPurchase', () => {
    it('insere compra e atualiza estoque do ingrediente', async () => {
      const insertMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const updateEqMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const updateMock = vi.fn().mockReturnValue({ eq: updateEqMock })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'ingredient_purchases') return { insert: insertMock }
        if (table === 'ingredients') return { update: updateMock }
        return {}
      })

      await createIngredientPurchase(validPurchaseData)

      expect(insertMock).toHaveBeenCalledWith(expect.objectContaining(validPurchaseData))
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/ingredientes')
    })

    it('lanca erro quando insert falha', async () => {
      const dbError = { message: 'DB error' }
      mockFrom.mockImplementation(() => ({
        insert: vi.fn().mockResolvedValue({ data: null, error: dbError }),
      }))

      await expect(createIngredientPurchase(validPurchaseData)).rejects.toEqual(dbError)
      expect(revalidatePath).not.toHaveBeenCalled()
    })
  })

  describe('getIngredientPurchases', () => {
    it('retorna lista de compras de um ingrediente com join', async () => {
      const purchases = [
        { id: 1, ingredient_id: 1, quantity: 10, unit_cost: 5.5, total_cost: 55, purchased_at: '2026-03-07' },
      ]

      const orderMock = vi.fn().mockResolvedValue({ data: purchases, error: null })
      const eqIngredientMock = vi.fn().mockReturnValue({ order: orderMock })
      const eqTenantMock = vi.fn().mockReturnValue({ eq: eqIngredientMock })
      const selectMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      mockFrom.mockReturnValue({ select: selectMock })

      const result = await getIngredientPurchases(1)

      expect(mockFrom).toHaveBeenCalledWith('ingredient_purchases')
      expect(eqIngredientMock).toHaveBeenCalledWith('ingredient_id', 1)
      expect(result).toEqual(purchases)
    })

    it('retorna todas as compras quando nenhum ingrediente_id passado', async () => {
      const purchases = [{ id: 1 }, { id: 2 }]
      const orderMock = vi.fn().mockResolvedValue({ data: purchases, error: null })
      const eqTenantMock = vi.fn().mockReturnValue({ order: orderMock })
      const selectMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      mockFrom.mockReturnValue({ select: selectMock })

      const result = await getIngredientPurchases()

      expect(mockFrom).toHaveBeenCalledWith('ingredient_purchases')
      expect(result).toEqual(purchases)
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      const orderMock = vi.fn().mockResolvedValue({ data: null, error: dbError })
      const eqIngredientMock = vi.fn().mockReturnValue({ order: orderMock })
      const eqTenantMock = vi.fn().mockReturnValue({ eq: eqIngredientMock })
      const selectMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      mockFrom.mockReturnValue({ select: selectMock })

      await expect(getIngredientPurchases(1)).rejects.toEqual(dbError)
    })
  })

  describe('deleteIngredientPurchase', () => {
    it('deleta compra por id', async () => {
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const deleteMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      mockFrom.mockReturnValue({ delete: deleteMock })

      await deleteIngredientPurchase(1)

      expect(mockFrom).toHaveBeenCalledWith('ingredient_purchases')
      expect(eqIdMock).toHaveBeenCalledWith('id', 1)
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/ingredientes')
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: dbError })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const deleteMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      mockFrom.mockReturnValue({ delete: deleteMock })

      await expect(deleteIngredientPurchase(1)).rejects.toEqual(dbError)
    })
  })
})
