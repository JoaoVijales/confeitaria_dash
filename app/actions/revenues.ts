'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { revenueSchema } from '@/lib/validations/revenue.schema'

const supabase = createClient()

export async function createRevenue(formData: FormData) {
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
  const { error } = await supabase.from('revenue_entries').delete().eq('id', id)

  if (error) {
    throw error
  }

  revalidatePath('/dashboard/entradas')
}
