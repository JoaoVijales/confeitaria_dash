'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/tenant'
import { expenseSchema } from '@/lib/validations/expense.schema'

export async function createExpense(formData: FormData) {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const data = Object.fromEntries(formData.entries())
  const parsed = expenseSchema.parse({
    ...data,
    quantity: Number(data.quantity),
    unit_price: Number(data.unit_price),
    total: Number(data.total),
  })

  const { error } = await supabase.from('expense_entries').insert({ ...parsed, tenant_id: tenantId })
  if (error) throw error

  revalidatePath('/dashboard/saidas')
}

export async function updateExpense(id: string, formData: FormData) {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const data = Object.fromEntries(formData.entries())
  const parsed = expenseSchema.parse({
    ...data,
    quantity: Number(data.quantity),
    unit_price: Number(data.unit_price),
    total: Number(data.total),
  })

  const { error } = await supabase
    .from('expense_entries')
    .update(parsed)
    .eq('id', id)
    .eq('tenant_id', tenantId)
  if (error) throw error

  revalidatePath('/dashboard/saidas')
}

export async function deleteExpense(id: string) {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const { error } = await supabase
    .from('expense_entries')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId)
  if (error) throw error

  revalidatePath('/dashboard/saidas')
}

export async function getExpenses() {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const { data, error } = await supabase
    .from('expense_entries')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('date', { ascending: false })
  if (error) throw error
  return data
}
