'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/tenant'
import { IngredientPurchaseFormValues } from '@/lib/validations/ingredient-purchase.schema'

export async function createIngredientPurchase(data: IngredientPurchaseFormValues) {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const { error } = await supabase.from('ingredient_purchases').insert({ ...data, tenant_id: tenantId })
  if (error) throw error

  revalidatePath('/dashboard/ingredientes')
}

export async function getIngredientPurchases(ingredientId?: number) {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const query = supabase
    .from('ingredient_purchases')
    .select('*, ingredients(name, unit)')
    .eq('tenant_id', tenantId)

  if (ingredientId !== undefined) {
    const { data, error } = await query.eq('ingredient_id', ingredientId).order('purchased_at', { ascending: false })
    if (error) throw error
    return data
  }

  const { data, error } = await query.order('purchased_at', { ascending: false })
  if (error) throw error
  return data
}

export async function deleteIngredientPurchase(id: number) {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const { error } = await supabase
    .from('ingredient_purchases')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId)
  if (error) throw error

  revalidatePath('/dashboard/ingredientes')
}
