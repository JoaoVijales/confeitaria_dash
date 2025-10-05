'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { revenueSchema } from '@/lib/validations/revenue.schema'
import { cookies } from 'next/headers'

export async function createRevenue(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const data = Object.fromEntries(formData.entries())
  const parsed = revenueSchema.parse({
    ...data,
    quantity: Number(data.quantity),
    unit_price: Number(data.unit_price),
    total: Number(data.total),
  })

  const { error } = await supabase.from('revenue_entries').insert(parsed)

  if (error) {
    throw error
  }

  revalidatePath('/dashboard/entradas')
}

export async function updateRevenue(id: string, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const data = Object.fromEntries(formData.entries())
  const parsed = revenueSchema.parse({
    ...data,
    quantity: Number(data.quantity),
    unit_price: Number(data.unit_price),
    total: Number(data.total),
  })

  const { error } = await supabase.from('revenue_entries').update(parsed).eq('id', id)

  if (error) {
    throw error
  }

  revalidatePath('/dashboard/entradas')
}

export async function deleteRevenue(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase.from('revenue_entries').delete().eq('id', id)

  if (error) {
    throw error
  }

  revalidatePath('/dashboard/entradas')
}

export async function getRevenues() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data, error } = await supabase.from('revenue_entries').select('*').order('date', { ascending: false })

  if (error) {
    throw error
  }

  return data
}
