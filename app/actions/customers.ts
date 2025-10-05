'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { customerSchema } from '@/lib/validations/customer.schema'
import { cookies } from 'next/headers'

export async function getCustomers() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data, error } = await supabase.from('customers').select('*').order('name')
  if (error) throw error
  return data
}

export async function createCustomer(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const data = Object.fromEntries(formData.entries())
  const parsed = customerSchema.parse({ ...data, is_vip: data.is_vip === 'on' })

  const { error } = await supabase.from('customers').insert(parsed)
  if (error) throw error

  revalidatePath('/dashboard/clientes')
}

export async function updateCustomer(id: string, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const data = Object.fromEntries(formData.entries())
  const parsed = customerSchema.parse({ ...data, is_vip: data.is_vip === 'on' })

  const { error } = await supabase.from('customers').update(parsed).eq('id', id)
  if (error) throw error

  revalidatePath('/dashboard/clientes')
}

export async function deleteCustomer(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase.from('customers').delete().eq('id', id)
  if (error) throw error

  revalidatePath('/dashboard/clientes')
}

// This function would likely be called after an order is created/updated
export async function updateCustomerStats(customerId: string) {
  // Logic to calculate total_orders and total_spent would go here.
  // This is a placeholder for now.
  console.log(`Updating stats for customer ${customerId}`)
  // Example: Fetch all orders for the customer, calculate totals, and update the customer record.
}
