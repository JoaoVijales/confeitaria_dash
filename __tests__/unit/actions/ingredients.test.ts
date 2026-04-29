import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/headers', () => ({ cookies: vi.fn().mockResolvedValue({}) }))

const mockFrom = vi.fn()
const mockSupabase = { from: mockFrom }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

vi.mock('@/lib/supabase/tenant', () => ({ getTenantId: vi.fn().mockResolvedValue('test-tenant-id') }))

vi.mock('@/app/actions/products', () => ({
  recomputeAndStoreProductCost: vi.fn().mockResolvedValue(undefined),
}))

import { createIngredient, updateIngredient, deleteIngredient } from '@/app/actions/ingredients'
import { revalidatePath } from 'next/cache'
import * as productsModule from '@/app/actions/products'

const validIngredientData = {
  name: 'Farinha de Trigo',
  unit: 'kg',
  quantity: 1,
  price_for_quantity: 5.50,
  current_stock: 20,
  min_stock: 5,
  category: 'Farinhas',
}

function mockNoopSelect(resolvedData: unknown[] = []) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: resolvedData, error: null }),
        }),
      }),
    }),
  }
}

function mockNoopSelectTwoEqs(resolvedData: unknown[] = []) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: resolvedData, error: null }),
      }),
    }),
  }
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
    it('atualiza ingrediente sem dependentes', async () => {
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'ingredients') return { update: updateMock }
        if (table === 'product_components') return mockNoopSelect([])
        if (table === 'recipe_ingredients') return mockNoopSelectTwoEqs([])
        return {}
      })

      await updateIngredient(1, validIngredientData)

      expect(mockFrom).toHaveBeenCalledWith('ingredients')
      expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
        name: validIngredientData.name,
        unit_cost: validIngredientData.price_for_quantity / validIngredientData.quantity,
      }))
      expect(eqIdMock).toHaveBeenCalledWith('id', 1)
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/ingredientes')
      expect(productsModule.recomputeAndStoreProductCost).not.toHaveBeenCalled()
    })

    it('propaga custo para produtos que usam o ingrediente diretamente', async () => {
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'ingredients') return { update: updateMock }
        if (table === 'product_components') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({ data: [{ product_id: 'prod-1' }], error: null }),
                }),
              }),
            }),
          }
        }
        if (table === 'recipe_ingredients') return mockNoopSelectTwoEqs([])
        return {}
      })

      await updateIngredient(1, validIngredientData)

      expect(productsModule.recomputeAndStoreProductCost).toHaveBeenCalledWith(
        mockSupabase, 'test-tenant-id', 'prod-1',
      )
    })

    it('propaga custo para produtos via receitas afetadas', async () => {
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })

      let productComponentsCallCount = 0
      mockFrom.mockImplementation((table: string) => {
        if (table === 'ingredients') return { update: updateMock }
        if (table === 'product_components') {
          productComponentsCallCount++
          if (productComponentsCallCount === 1) {
            // direct ingredient query — no direct products
            return mockNoopSelect([])
          }
          // recipe-based query
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({ data: [{ product_id: 'prod-2' }], error: null }),
                }),
              }),
            }),
          }
        }
        if (table === 'recipe_ingredients') {
          return mockNoopSelectTwoEqs([{ recipe_id: 'recipe-1' }])
        }
        return {}
      })

      await updateIngredient(1, validIngredientData)

      expect(productsModule.recomputeAndStoreProductCost).toHaveBeenCalledWith(
        mockSupabase, 'test-tenant-id', 'prod-2',
      )
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
