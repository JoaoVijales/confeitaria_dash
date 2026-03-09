'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/tenant'
import { cookies } from 'next/headers'

export async function createIngredient(data: { name: string; unit: string; unit_cost: number; current_stock: number; min_stock: number; category: string }) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const tenantId = await getTenantId(supabase)
  const { error } = await supabase.from('ingredients').insert({ ...data, tenant_id: tenantId })
  if (error) throw error
  revalidatePath('/dashboard/ingredientes')
}

export async function updateIngredient(id: number, data: { name: string; unit: string; unit_cost: number; current_stock: number; min_stock: number; category: string }) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const tenantId = await getTenantId(supabase)
  const { error } = await supabase
    .from('ingredients')
    .update(data)
    .eq('id', id)
    .eq('tenant_id', tenantId)
  if (error) throw error
  revalidatePath('/dashboard/ingredientes')
}

export async function deleteIngredient(id: number) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const tenantId = await getTenantId(supabase)
  const { error } = await supabase
    .from('ingredients')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId)
  if (error) throw error
  revalidatePath('/dashboard/ingredientes')
}
