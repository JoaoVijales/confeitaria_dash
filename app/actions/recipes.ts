'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const supabase = createClient()

export async function createRecipe(data: { product_id: string; yield: number; ingredients: { ingredient_id: string; quantity: number }[] }) {
  const { data: recipe, error: recipeError } = await supabase.from('recipes').insert({ product_id: data.product_id, yield: data.yield }).select().single()

  if (recipeError) throw recipeError

  const recipeIngredients = data.ingredients.map(ingredient => ({
    recipe_id: recipe.id,
    ...ingredient
  }))

  const { error: ingredientsError } = await supabase.from('recipe_ingredients').insert(recipeIngredients)

  if (ingredientsError) throw ingredientsError

  revalidatePath('/dashboard/receitas')
}

export async function updateRecipe(id: string, data: { product_id: string; yield: number; ingredients: { ingredient_id: string; quantity: number }[] }) {
  const { error: recipeError } = await supabase.from('recipes').update(data).eq('id', id)

  if (recipeError) throw recipeError

  const { error: deleteError } = await supabase.from('recipe_ingredients').delete().eq('recipe_id', id)

  if (deleteError) throw deleteError

  const recipeIngredients = data.ingredients.map(ingredient => ({
    recipe_id: id,
    ...ingredient
  }))

  const { error: ingredientsError } = await supabase.from('recipe_ingredients').insert(recipeIngredients)

  if (ingredientsError) throw ingredientsError

  revalidatePath('/dashboard/receitas')
}

export async function deleteRecipe(id: string) {
  const { error } = await supabase.from('recipes').delete().eq('id', id)
  if (error) {
    throw error
  }
  revalidatePath('/dashboard/receitas')
}
