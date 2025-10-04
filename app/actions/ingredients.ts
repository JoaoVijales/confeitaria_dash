'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const supabase = createClient()

export async function createIngredient(data: { name: string; unit: string; unit_cost: number; current_stock: number; min_stock: number; category: string }) {
  const { error } = await supabase.from('ingredients').insert(data)
  if (error) {
    throw error
  }
  revalidatePath('/dashboard/ingredientes')
}

export async function updateIngredient(id: number, data: { name: string; unit: string; unit_cost: number; current_stock: number; min_stock: number; category: string }) {
  const { error } = await supabase.from('ingredients').update(data).eq('id', id)
  if (error) {
    throw error
  }
  revalidatePath('/dashboard/ingredientes')
}

export async function deleteIngredient(id: number) {
  const { error } = await supabase.from('ingredients').delete().eq('id', id)
  if (error) {
    throw error
  }
  revalidatePath('/dashboard/ingredientes')
}
