'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const supabase = createClient()

export async function createOrder(data: { customer_id: number; total: number; status: string }) {
  const { error } = await supabase.from('orders').insert(data)
  if (error) {
    throw error
  }
  revalidatePath('/dashboard/pedidos')
}

export async function updateOrder(id: number, data: { status: string }) {
  const { error } = await supabase.from('orders').update(data).eq('id', id)
  if (error) {
    throw error
  }
  revalidatePath('/dashboard/pedidos')
}

export async function deleteOrder(id: number) {
  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) {
    throw error
  }
  revalidatePath('/dashboard/pedidos')
}
