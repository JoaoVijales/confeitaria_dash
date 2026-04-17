'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/tenant'
import { handleSupabaseError } from '@/lib/logger'

export async function createRecipe(data: { product_id: string; yield: number; ingredients: { ingredient_id: string; quantity: number }[] }) {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .insert({ product_id: data.product_id, yield: data.yield, tenant_id: tenantId })
    .select()
    .single()

  handleSupabaseError(recipeError, 'createRecipe:insertRecipe', { tenantId, data: { product_id: data.product_id, yield: data.yield } })

  const recipeIngredients = data.ingredients.map(ingredient => ({
    recipe_id: recipe.id,
    tenant_id: tenantId,
    ...ingredient,
  }))

  const { error: ingredientsError } = await supabase.from('recipe_ingredients').insert(recipeIngredients)
  handleSupabaseError(ingredientsError, 'createRecipe:insertIngredients', { tenantId, recipeId: recipe.id })

  revalidatePath('/dashboard/receitas')
}

export async function updateRecipe(id: string, data: { product_id: string; yield: number; ingredients: { ingredient_id: string; quantity: number }[] }) {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const { error: recipeError } = await supabase
    .from('recipes')
    .update({ product_id: data.product_id, yield: data.yield })
    .eq('id', id)
    .eq('tenant_id', tenantId)

  handleSupabaseError(recipeError, 'updateRecipe:updateRecipe', { tenantId, recipeId: id })

  const { error: deleteError } = await supabase
    .from('recipe_ingredients')
    .delete()
    .eq('recipe_id', id)
    .eq('tenant_id', tenantId)

  handleSupabaseError(deleteError, 'updateRecipe:deleteIngredients', { tenantId, recipeId: id })

  const recipeIngredients = data.ingredients.map(ingredient => ({
    recipe_id: id,
    tenant_id: tenantId,
    ...ingredient,
  }))

  const { error: ingredientsError } = await supabase.from('recipe_ingredients').insert(recipeIngredients)
  handleSupabaseError(ingredientsError, 'updateRecipe:insertIngredients', { tenantId, recipeId: id })

  revalidatePath('/dashboard/receitas')
}

export async function deleteRecipe(id: string) {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId)
  handleSupabaseError(error, 'deleteRecipe', { tenantId, recipeId: id })
  revalidatePath('/dashboard/receitas')
}
