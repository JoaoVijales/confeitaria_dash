'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/tenant'
import { customerSchema } from '@/lib/validations/customer.schema'

export async function getCustomers() {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name')
  if (error) throw error
  return data
}

export async function createCustomer(formData: FormData) {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const data = Object.fromEntries(formData.entries())
  const parsed = customerSchema.parse({ ...data, is_vip: data.is_vip === 'on' })

  const { error } = await supabase.from('customers').insert({ ...parsed, tenant_id: tenantId })
  if (error) throw error

  revalidatePath('/dashboard/clientes')
}

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const data = Object.fromEntries(formData.entries())
  const parsed = customerSchema.parse({ ...data, is_vip: data.is_vip === 'on' })

  const { error } = await supabase
    .from('customers')
    .update(parsed)
    .eq('id', id)
    .eq('tenant_id', tenantId)
  if (error) throw error

  revalidatePath('/dashboard/clientes')
}

export async function deleteCustomer(id: string) {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId)
  if (error) throw error

  revalidatePath('/dashboard/clientes')
}

export async function updateCustomerStats(customerId: string) {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('total')
    .eq('customer_id', customerId)
    .eq('tenant_id', tenantId)

  if (ordersError) throw ordersError

  const total_orders = orders.length
  const total_spent = orders.reduce((acc, order) => acc + order.total, 0)

  const { error } = await supabase
    .from('customers')
    .update({ total_orders, total_spent })
    .eq('id', customerId)
    .eq('tenant_id', tenantId)

  if (error) throw error
}

export async function getCustomerOrders(customerId: string) {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name))')
    .eq('customer_id', customerId)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
