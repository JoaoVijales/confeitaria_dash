'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/tenant'
import { handleSupabaseError } from '@/lib/logger'

export async function getRecipes() {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const { data, error } = await supabase
    .from('recipes')
    .select(`
      id,
      yield,
      yield_unit,
      products (id, name, price, cost),
      recipe_ingredients (
        quantity,
        ingredients (id, name, unit, unit_cost)
      )
    `)
    .eq('tenant_id', tenantId)

  handleSupabaseError(error, 'getRecipes', { tenantId })

  return (data ?? []).map(recipe => {
    const ris = (recipe.recipe_ingredients ?? []) as { quantity: number; ingredients: { unit_cost: number }[] }[]
    const totalCost = ris.reduce((sum: number, ri) => {
      return sum + (ri.ingredients?.[0]?.unit_cost ?? 0) * ri.quantity
    }, 0)
    const cost_per_yield_unit = recipe.yield > 0 ? totalCost / recipe.yield : 0

    // Normalise products to always be an array (recipe page expects products?.[0])
    const rawProducts = recipe.products
    const products = Array.isArray(rawProducts)
      ? rawProducts
      : rawProducts
      ? [rawProducts]
      : null

    return { ...recipe, products, cost_per_yield_unit }
  })
}

export async function createRecipe(data: {
  product_id: string
  yield: number
  yield_unit?: string
  ingredients: { ingredient_id: string; quantity: number }[]
}) {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .insert({
      product_id: data.product_id,
      yield: data.yield,
      yield_unit: data.yield_unit ?? 'un',
      tenant_id: tenantId,
    })
    .select()
    .single()

  handleSupabaseError(recipeError, 'createRecipe:insertRecipe', { tenantId })

  const recipeIngredients = data.ingredients.map(ingredient => ({
    recipe_id: recipe.id,
    tenant_id: tenantId,
    ...ingredient,
  }))

  const { error: ingredientsError } = await supabase.from('recipe_ingredients').insert(recipeIngredients)
  if (ingredientsError) {
    await supabase.from('recipes').delete().eq('id', recipe.id).eq('tenant_id', tenantId)
  }
  handleSupabaseError(ingredientsError, 'createRecipe:insertIngredients', { tenantId, recipeId: recipe.id })

  revalidatePath('/dashboard/receitas')
}

export async function updateRecipe(
  id: string,
  data: {
    product_id: string
    yield: number
    yield_unit?: string
    ingredients: { ingredient_id: string; quantity: number }[]
  },
) {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const { error: recipeError } = await supabase
    .from('recipes')
    .update({ product_id: data.product_id, yield: data.yield, yield_unit: data.yield_unit ?? 'un' })
    .eq('id', id)
    .eq('tenant_id', tenantId)

  handleSupabaseError(recipeError, 'updateRecipe:updateRecipe', { tenantId, recipeId: id })

  const { data: existingIngredients } = await supabase
    .from('recipe_ingredients')
    .select('*')
    .eq('recipe_id', id)
    .eq('tenant_id', tenantId)

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
  if (ingredientsError && existingIngredients?.length) {
    await supabase.from('recipe_ingredients').insert(existingIngredients)
  }
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
