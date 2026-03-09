'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/tenant'
import { cookies } from 'next/headers'

export async function createRecipe(data: { product_id: string; yield: number; ingredients: { ingredient_id: string; quantity: number }[] }) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const tenantId = await getTenantId(supabase)

  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .insert({ product_id: data.product_id, yield: data.yield, tenant_id: tenantId })
    .select()
    .single()

  if (recipeError) throw recipeError

  const recipeIngredients = data.ingredients.map(ingredient => ({
    recipe_id: recipe.id,
    tenant_id: tenantId,
    ...ingredient,
  }))

  const { error: ingredientsError } = await supabase.from('recipe_ingredients').insert(recipeIngredients)
  if (ingredientsError) throw ingredientsError

  revalidatePath('/dashboard/receitas')
}

export async function updateRecipe(id: string, data: { product_id: string; yield: number; ingredients: { ingredient_id: string; quantity: number }[] }) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const tenantId = await getTenantId(supabase)

  const { error: recipeError } = await supabase
    .from('recipes')
    .update({ product_id: data.product_id, yield: data.yield })
    .eq('id', id)
    .eq('tenant_id', tenantId)

  if (recipeError) throw recipeError

  const { error: deleteError } = await supabase
    .from('recipe_ingredients')
    .delete()
    .eq('recipe_id', id)
    .eq('tenant_id', tenantId)

  if (deleteError) throw deleteError

  const recipeIngredients = data.ingredients.map(ingredient => ({
    recipe_id: id,
    tenant_id: tenantId,
    ...ingredient,
  }))

  const { error: ingredientsError } = await supabase.from('recipe_ingredients').insert(recipeIngredients)
  if (ingredientsError) throw ingredientsError

  revalidatePath('/dashboard/receitas')
}

export async function deleteRecipe(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const tenantId = await getTenantId(supabase)
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId)
  if (error) throw error
  revalidatePath('/dashboard/receitas')
}
