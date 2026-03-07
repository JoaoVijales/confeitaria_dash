'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { IngredientPurchaseFormValues } from '@/lib/validations/ingredient-purchase.schema'

export async function createIngredientPurchase(data: IngredientPurchaseFormValues) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.from('ingredient_purchases').insert(data)
  if (error) throw error

  revalidatePath('/dashboard/ingredientes')
}

export async function getIngredientPurchases(ingredientId?: number) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const query = supabase
    .from('ingredient_purchases')
    .select('*, ingredients(name, unit)')

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
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.from('ingredient_purchases').delete().eq('id', id)
  if (error) throw error

  revalidatePath('/dashboard/ingredientes')
}
