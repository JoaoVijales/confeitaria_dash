'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/tenant'
import { handleSupabaseError } from '@/lib/logger'

export async function createOrder(data: { customer_id: string; items: { product_id: string; quantity: number; unit_price: number; }[]; total: number; status: string }) {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: data.customer_id,
      total: data.total,
      status: data.status,
      tenant_id: tenantId,
    })
    .select('id')
    .single()

  handleSupabaseError(orderError, 'createOrder:insertOrder', { tenantId, data: { customer_id: data.customer_id, total: data.total } })
  const orderId = orderData!.id

  const orderItems = data.items.map(item => ({
    order_id: orderId,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    tenant_id: tenantId,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

  if (itemsError) {
    await supabase.from('orders').delete().eq('id', orderId).eq('tenant_id', tenantId)
    handleSupabaseError(itemsError, 'createOrder:insertItems', { tenantId, orderId })
  }

  revalidatePath('/dashboard/pedidos')

  const { updateCustomerStats } = await import('@/app/actions/customers')
  await updateCustomerStats(data.customer_id)
}

export async function updateOrderStatus(id: string, status: string) {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .eq('tenant_id', tenantId)
  handleSupabaseError(error, 'updateOrderStatus', { tenantId, orderId: id, status })
  revalidatePath('/dashboard/pedidos')
}

export async function deleteOrder(id: string) {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const { error: itemsError } = await supabase
    .from('order_items')
    .delete()
    .eq('order_id', id)
    .eq('tenant_id', tenantId)
  handleSupabaseError(itemsError, 'deleteOrder:deleteItems', { tenantId, orderId: id })

  const { error: orderError } = await supabase
    .from('orders')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId)
  handleSupabaseError(orderError, 'deleteOrder:deleteOrder', { tenantId, orderId: id })

  revalidatePath('/dashboard/pedidos')
}

export async function getOrders() {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const { data, error } = await supabase
    .from('orders')
    .select('*, customers(name)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  handleSupabaseError(error, 'getOrders', { tenantId })
  return data
}

export async function getOrderDetails(id: string) {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const { data, error } = await supabase
    .from('orders')
    .select('*, customers(name, email), order_items(*, products(name))')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single()

  handleSupabaseError(error, 'getOrderDetails', { tenantId, orderId: id })
  return data
}
