'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { expenseSchema } from '@/lib/validations/expense.schema'
import { cookies } from 'next/headers'

export async function createExpense(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const data = Object.fromEntries(formData.entries())
  const parsed = expenseSchema.parse({
    ...data,
    quantity: Number(data.quantity),
    unit_price: Number(data.unit_price),
    total: Number(data.total),
  })

  const { error } = await supabase.from('expense_entries').insert(parsed)

  if (error) {
    throw error
  }

  revalidatePath('/dashboard/saidas')
}

export async function updateExpense(id: string, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const data = Object.fromEntries(formData.entries())
  const parsed = expenseSchema.parse({
    ...data,
    quantity: Number(data.quantity),
    unit_price: Number(data.unit_price),
    total: Number(data.total),
  })

  const { error } = await supabase.from('expense_entries').update(parsed).eq('id', id)

  if (error) {
    throw error
  }

  revalidatePath('/dashboard/saidas')
}

export async function deleteExpense(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase.from('expense_entries').delete().eq('id', id)

  if (error) {
    throw error
  }

  revalidatePath('/dashboard/saidas')
}

export async function getExpenses() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data, error } = await supabase.from('expense_entries').select('*').order('date', { ascending: false })

  if (error) {
    throw error
  }

  return data
}
