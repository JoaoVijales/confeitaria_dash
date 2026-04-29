import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/headers', () => ({ cookies: vi.fn().mockResolvedValue({}) }))

const mockFrom = vi.fn()
const mockSupabase = { from: mockFrom }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

vi.mock('@/lib/supabase/tenant', () => ({ getTenantId: vi.fn().mockResolvedValue('test-tenant-id') }))

import { createRecipe, updateRecipe, deleteRecipe } from '@/app/actions/recipes'
import { revalidatePath } from 'next/cache'

const validRecipeData = {
  name: 'Massa de Bolo de Chocolate',
  yield: 10,
  yield_unit: 'un',
  ingredients: [
    { ingredient_id: 'ing-1', quantity: 200, unit: 'g' },
    { ingredient_id: 'ing-2', quantity: 3, unit: 'un' },
  ],
}

describe('recipes actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createRecipe', () => {
    it('cria receita com nome e ingredientes com unidade', async () => {
      const ingredientsInsertMock = vi.fn().mockResolvedValue({ data: null, error: null })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'recipes') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'recipe-1' },
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'recipe_ingredients') {
          return { insert: ingredientsInsertMock }
        }
        return {}
      })

      await createRecipe(validRecipeData)

      expect(ingredientsInsertMock).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ recipe_id: 'recipe-1', ingredient_id: 'ing-1', quantity: 200, unit: 'g' }),
        expect.objectContaining({ recipe_id: 'recipe-1', ingredient_id: 'ing-2', quantity: 3, unit: 'un' }),
      ]))
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/receitas')
    })

    it('lanca erro quando insert da receita falha', async () => {
      const dbError = { message: 'DB error' }
      mockFrom.mockImplementation((table: string) => {
        if (table === 'recipes') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: dbError }),
              }),
            }),
          }
        }
        return {}
      })

      await expect(createRecipe(validRecipeData)).rejects.toEqual(dbError)
    })

    it('lanca erro quando insert de ingredientes falha', async () => {
      const ingredientsError = { message: 'Ingredients error' }

      mockFrom.mockImplementation((table: string) => {
        if (table === 'recipes') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'recipe-1' },
                  error: null,
                }),
              }),
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }
        }
        if (table === 'recipe_ingredients') {
          return {
            insert: vi.fn().mockResolvedValue({ data: null, error: ingredientsError }),
          }
        }
        return {}
      })

      await expect(createRecipe(validRecipeData)).rejects.toEqual(ingredientsError)
    })

    it('faz rollback (deleta receita) quando insert de ingredientes falha', async () => {
      const ingredientsError = { message: 'Ingredients error' }
      const recipeDeleteEqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const recipeDeleteEqIdMock = vi.fn().mockReturnValue({ eq: recipeDeleteEqTenantMock })
      const recipeDeleteMock = vi.fn().mockReturnValue({ eq: recipeDeleteEqIdMock })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'recipes') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 'recipe-1' }, error: null }),
              }),
            }),
            delete: recipeDeleteMock,
          }
        }
        if (table === 'recipe_ingredients') {
          return { insert: vi.fn().mockResolvedValue({ data: null, error: ingredientsError }) }
        }
        return {}
      })

      await expect(createRecipe(validRecipeData)).rejects.toEqual(ingredientsError)
      expect(recipeDeleteMock).toHaveBeenCalled()
      expect(recipeDeleteEqIdMock).toHaveBeenCalledWith('id', 'recipe-1')
    })
  })

  describe('updateRecipe', () => {
    it('atualiza receita, deleta e recria ingredientes com unidade', async () => {
      const ingredientsInsertMock = vi.fn().mockResolvedValue({ data: null, error: null })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'recipes') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }
        }
        if (table === 'recipe_ingredients') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
            insert: ingredientsInsertMock,
          }
        }
        return {}
      })

      await updateRecipe('recipe-1', validRecipeData)

      expect(ingredientsInsertMock).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ recipe_id: 'recipe-1', ingredient_id: 'ing-1', quantity: 200, unit: 'g' }),
        expect.objectContaining({ recipe_id: 'recipe-1', ingredient_id: 'ing-2', quantity: 3, unit: 'un' }),
      ]))
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/receitas')
    })

    it('lanca erro quando update da receita falha', async () => {
      const dbError = { message: 'DB error' }

      mockFrom.mockImplementation((table: string) => {
        if (table === 'recipes') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: null, error: dbError }),
              }),
            }),
          }
        }
        if (table === 'recipe_ingredients') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          }
        }
        return {}
      })

      await expect(updateRecipe('recipe-1', validRecipeData)).rejects.toEqual(dbError)
    })

    it('lanca erro quando delete de ingredientes falha', async () => {
      const deleteError = { message: 'Delete error' }

      mockFrom.mockImplementation((table: string) => {
        if (table === 'recipes') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }
        }
        if (table === 'recipe_ingredients') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: null, error: deleteError }),
              }),
            }),
          }
        }
        return {}
      })

      await expect(updateRecipe('recipe-1', validRecipeData)).rejects.toEqual(deleteError)
    })

    it('faz rollback (restaura ingredientes) quando insert de novos ingredientes falha', async () => {
      const insertError = { message: 'Insert error' }
      const oldIngredients = [{ recipe_id: 'recipe-1', ingredient_id: 'ing-old', quantity: 5, unit: 'g', tenant_id: 'test-tenant-id' }]
      let insertCallCount = 0
      const insertMock = vi.fn().mockImplementation(() => {
        insertCallCount++
        if (insertCallCount === 1) return Promise.resolve({ data: null, error: insertError })
        return Promise.resolve({ data: null, error: null })
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'recipes') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }
        }
        if (table === 'recipe_ingredients') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: oldIngredients, error: null }),
              }),
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
            insert: insertMock,
          }
        }
        return {}
      })

      await expect(updateRecipe('recipe-1', validRecipeData)).rejects.toEqual(insertError)
      expect(insertMock).toHaveBeenCalledTimes(2)
      expect(insertMock).toHaveBeenNthCalledWith(2, oldIngredients)
    })
  })

  describe('deleteRecipe', () => {
    it('deleta receita por id', async () => {
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const deleteMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      mockFrom.mockReturnValue({ delete: deleteMock })

      await deleteRecipe('recipe-1')

      expect(mockFrom).toHaveBeenCalledWith('recipes')
      expect(eqIdMock).toHaveBeenCalledWith('id', 'recipe-1')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/receitas')
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: dbError })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const deleteMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      mockFrom.mockReturnValue({ delete: deleteMock })

      await expect(deleteRecipe('recipe-1')).rejects.toEqual(dbError)
    })
  })
})
