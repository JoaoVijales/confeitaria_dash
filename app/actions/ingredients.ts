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

export async function createIngredient(data: { name: string; unit: string; unit_cost: number; current_stock: number; min_stock: number; category: string }) {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const { error } = await supabase.from('ingredients').insert({ ...data, tenant_id: tenantId })
  handleSupabaseError(error, 'createIngredient', { tenantId, data })
  revalidatePath('/dashboard/ingredientes')
}

export async function updateIngredient(id: number, data: { name: string; unit: string; unit_cost: number; current_stock: number; min_stock: number; category: string }) {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const { error } = await supabase
    .from('ingredients')
    .update(data)
    .eq('id', id)
    .eq('tenant_id', tenantId)
  handleSupabaseError(error, 'updateIngredient', { tenantId, ingredientId: id, data })
  revalidatePath('/dashboard/ingredientes')
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
