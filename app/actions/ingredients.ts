'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/tenant'
import { handleSupabaseError } from '@/lib/logger'

export async function getIngredients() {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name')
  handleSupabaseError(error, 'getIngredients', { tenantId })
  return data ?? []
}

type IngredientData = {
  name: string
  unit: string
  quantity: number
  price_for_quantity: number
  current_stock: number
  min_stock: number
  category: string
}

export async function createIngredient(data: IngredientData) {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const unit_cost = data.quantity > 0 ? data.price_for_quantity / data.quantity : 0
  const { error } = await supabase
    .from('ingredients')
    .insert({ ...data, unit_cost, tenant_id: tenantId })
  handleSupabaseError(error, 'createIngredient', { tenantId, data })
  revalidatePath('/dashboard/ingredientes')
}

export async function updateIngredient(id: number, data: IngredientData) {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const unit_cost = data.quantity > 0 ? data.price_for_quantity / data.quantity : 0

  const { error } = await supabase
    .from('ingredients')
    .update({ ...data, unit_cost })
    .eq('id', id)
    .eq('tenant_id', tenantId)
  handleSupabaseError(error, 'updateIngredient', { tenantId, ingredientId: id, data })

  // Products using this ingredient directly
  const { data: directComponents } = await supabase
    .from('product_components')
    .select('product_id')
    .eq('ingredient_id', id)
    .eq('component_type', 'ingredient')
    .eq('tenant_id', tenantId)

  // Recipes using this ingredient → products using those recipes
  const { data: affectedRecipeRows } = await supabase
    .from('recipe_ingredients')
    .select('recipe_id')
    .eq('ingredient_id', id)
    .eq('tenant_id', tenantId)

  const recipeIds = [...new Set((affectedRecipeRows ?? []).map(r => r.recipe_id as string))]
  let recipeBasedProductIds: string[] = []
  if (recipeIds.length > 0) {
    const { data: recipeComponents } = await supabase
      .from('product_components')
      .select('product_id')
      .in('recipe_id', recipeIds)
      .eq('component_type', 'recipe')
      .eq('tenant_id', tenantId)
    recipeBasedProductIds = (recipeComponents ?? []).map(c => c.product_id as string)
  }

  const allProductIds = [...new Set([
    ...(directComponents ?? []).map(c => c.product_id as string),
    ...recipeBasedProductIds,
  ])]

  if (allProductIds.length > 0) {
    const { recomputeAndStoreProductCost } = await import('@/app/actions/products')
    for (const productId of allProductIds) {
      await recomputeAndStoreProductCost(supabase, tenantId, productId)
    }
  }

  revalidatePath('/dashboard/ingredientes')
  revalidatePath('/dashboard/produtos')
  revalidatePath('/dashboard/receitas')
}

export async function deleteIngredient(id: number) {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const { error } = await supabase
    .from('ingredients')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId)
  handleSupabaseError(error, 'deleteIngredient', { tenantId, ingredientId: id })
  revalidatePath('/dashboard/ingredientes')
}
