'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const supabase = createClient()

export async function createCustomer(data: { name: string; email: string; phone: string }) {
  const { error } = await supabase.from('customers').insert(data)
  if (error) {
    throw error
  }
  revalidatePath('/dashboard/clientes')
}

export async function updateCustomer(id: number, data: { name: string; email: string; phone: string }) {
  const { error } = await supabase.from('customers').update(data).eq('id', id)
  if (error) {
    throw error
  }
  revalidatePath('/dashboard/clientes')
}

export async function deleteCustomer(id: number) {
  const { error } = await supabase.from('customers').delete().eq('id', id)
  if (error) {
    throw error
  }
  revalidatePath('/dashboard/clientes')
}
