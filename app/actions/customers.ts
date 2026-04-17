'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/tenant'
import { customerSchema } from '@/lib/validations/customer.schema'
import { handleSupabaseError } from '@/lib/logger'

export async function getCustomers() {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const { data, error } = await supabase
    .from('customers')
    .select(`
      id, name, email, phone, is_vip, total_orders, total_spent, created_at,
      orders (created_at)
    `)
    .eq('tenant_id', tenantId)
    .order('name')
  handleSupabaseError(error, 'getCustomers', { tenantId })

  return (data ?? []).map(({ orders, ...customer }) => ({
    ...customer,
    last_purchase: orders.length > 0
      ? [...orders].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )[0].created_at
      : null,
  }))
}

export async function createCustomer(formData: FormData) {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const data = Object.fromEntries(formData.entries())
  const parsed = customerSchema.parse({ ...data, is_vip: data.is_vip === 'on' })

  const { error } = await supabase.from('customers').insert({ ...parsed, tenant_id: tenantId })
  handleSupabaseError(error, 'createCustomer', { tenantId, data: parsed })

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
  handleSupabaseError(error, 'updateCustomer', { tenantId, customerId: id, data: parsed })

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
  handleSupabaseError(error, 'deleteCustomer', { tenantId, customerId: id })

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

  handleSupabaseError(ordersError, 'updateCustomerStats:getOrders', { tenantId, customerId })

  const safeOrders = orders ?? []
  const total_orders = safeOrders.length
  const total_spent = safeOrders.reduce((acc, order) => acc + order.total, 0)

  const { error } = await supabase
    .from('customers')
    .update({ total_orders, total_spent })
    .eq('id', customerId)
    .eq('tenant_id', tenantId)

  handleSupabaseError(error, 'updateCustomerStats:updateCustomer', { tenantId, customerId, total_orders, total_spent })
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

  handleSupabaseError(error, 'getCustomerOrders', { tenantId, customerId })
  return data
}
