'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { expenseSchema } from '@/lib/validations/expense.schema'

const supabase = createClient()

export async function createExpense(formData: FormData) {
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
  const { error } = await supabase.from('expense_entries').delete().eq('id', id)

  if (error) {
    throw error
  }

  revalidatePath('/dashboard/saidas')
}
