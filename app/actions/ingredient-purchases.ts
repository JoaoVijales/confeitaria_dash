'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/tenant'
import { IngredientPurchaseFormValues } from '@/lib/validations/ingredient-purchase.schema'
import { handleSupabaseError } from '@/lib/logger'

export async function createIngredientPurchase(data: IngredientPurchaseFormValues) {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const { data: purchase, error } = await supabase
    .from('ingredient_purchases')
    .insert({ ...data, tenant_id: tenantId })
    .select('id')
    .single()
  handleSupabaseError(error, 'createIngredientPurchase', { tenantId, data })

  // Busca nome do ingrediente para descrição legível na saída
  const { data: ingredient } = await supabase
    .from('ingredients')
    .select('name')
    .eq('id', data.ingredient_id)
    .eq('tenant_id', tenantId)
    .single()

  const description = ingredient?.name
    ? `Compra: ${ingredient.name}${data.supplier ? ` — ${data.supplier}` : ''}`
    : `Compra de ingrediente #${data.ingredient_id}${data.supplier ? ` — ${data.supplier}` : ''}`

  const { error: expenseError } = await supabase.from('expense_entries').insert({
    tenant_id: tenantId,
    date: data.purchased_at,
    description,
    category: 'Ingredientes',
    quantity: data.quantity,
    unit_price: data.unit_cost,
    total: data.total_cost,
    ingredient_purchase_id: purchase!.id,
  })
  handleSupabaseError(expenseError, 'createIngredientPurchase:createExpense', { tenantId })

  const { error: updateError } = await supabase
    .from('ingredients')
    .update({ unit_cost: data.unit_cost })
    .eq('id', data.ingredient_id)
    .eq('tenant_id', tenantId)
  handleSupabaseError(updateError, 'createIngredientPurchase:updateUnitCost', { tenantId, ingredientId: data.ingredient_id })

  revalidatePath('/dashboard/ingredientes')
  revalidatePath('/dashboard/saidas')
  revalidatePath('/dashboard/financeiro')
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
    handleSupabaseError(error, 'getIngredientPurchases:byIngredient', { tenantId, ingredientId })
    return data
  }

  const { data, error } = await query.order('purchased_at', { ascending: false })
  handleSupabaseError(error, 'getIngredientPurchases:all', { tenantId })
  return data
}

export async function deleteIngredientPurchase(id: number) {
  const supabase = createClient()
  const tenantId = await getTenantId()

  // ON DELETE CASCADE em expense_entries.ingredient_purchase_id remove a saída automaticamente
  const { error } = await supabase
    .from('ingredient_purchases')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId)
  handleSupabaseError(error, 'deleteIngredientPurchase', { tenantId, purchaseId: id })

  revalidatePath('/dashboard/ingredientes')
  revalidatePath('/dashboard/saidas')
  revalidatePath('/dashboard/financeiro')
}
