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
      name,
      yield,
      yield_unit,
      recipe_ingredients (
        quantity,
        unit,
        ingredients (id, name, unit, unit_cost)
      )
    `)
    .eq('tenant_id', tenantId)

  handleSupabaseError(error, 'getRecipes', { tenantId })

  return (data ?? []).map(recipe => {
    const ris = (recipe.recipe_ingredients ?? []) as {
      quantity: number
      unit: string
      ingredients: { unit_cost: number; unit: string }[]
    }[]

    // Custo total: soma de (unit_cost * quantity) por ingrediente
    // A conversão de unidade (g→kg) é feita no frontend via calculateTotalRecipeCost
    const totalCost = ris.reduce((sum, ri) => {
      return sum + (ri.ingredients?.[0]?.unit_cost ?? 0) * ri.quantity
    }, 0)
    const cost_per_yield_unit = recipe.yield > 0 ? totalCost / recipe.yield : 0

    return { ...recipe, cost_per_yield_unit }
  })
}

export async function createRecipe(data: {
  name: string
  yield: number
  yield_unit: string
  ingredients: { ingredient_id: string; quantity: number; unit: string }[]
}) {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .insert({
      name: data.name,
      yield: data.yield,
      yield_unit: data.yield_unit,
      tenant_id: tenantId,
    })
    .select()
    .single()

  handleSupabaseError(recipeError, 'createRecipe:insertRecipe', { tenantId })

  const recipeIngredients = data.ingredients.map(ingredient => ({
    recipe_id: recipe.id,
    tenant_id: tenantId,
    ingredient_id: ingredient.ingredient_id,
    quantity: ingredient.quantity,
    unit: ingredient.unit,
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
    name: string
    yield: number
    yield_unit: string
    ingredients: { ingredient_id: string; quantity: number; unit: string }[]
  },
) {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const { error: recipeError } = await supabase
    .from('recipes')
    .update({ name: data.name, yield: data.yield, yield_unit: data.yield_unit })
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
    ingredient_id: ingredient.ingredient_id,
    quantity: ingredient.quantity,
    unit: ingredient.unit,
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
