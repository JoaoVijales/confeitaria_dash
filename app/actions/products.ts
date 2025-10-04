'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const supabase = createClient()

export async function createProduct(data: { name: string; price: number; category: string; stock: number; cost: number; min_stock: number }) {
  const { error } = await supabase.from('products').insert(data)
  if (error) {
    throw error
  }
  revalidatePath('/dashboard/produtos')
}

export async function updateProduct(id: string, data: { name: string; price: number; category: string; stock: number; cost: number; min_stock: number }) {
  const { error } = await supabase.from('products').update(data).eq('id', id)
  if (error) {
    throw error
  }
  revalidatePath('/dashboard/produtos')
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) {
    throw error
  }
  revalidatePath('/dashboard/produtos')
}
