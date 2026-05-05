'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getTenantId, getTenantPlan, isTenantAdmin } from '@/lib/supabase/tenant'
import { handleSupabaseError } from '@/lib/logger'
import { orderStatusSchema } from '@/lib/validations/order.schema'
import { isAtOrderLimit, getPlanLimits } from '@/lib/utils/plan-limits'

export async function createOrder(data: { customer_id: string; items: { product_id: string; quantity: number; unit_price: number; }[]; total: number; status: string }) {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const now = new Date()
  const curMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { count: orderCount } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .gte('created_at', curMonthStart)

  const isAdmin = await isTenantAdmin(tenantId)
  const plan = await getTenantPlan(tenantId)
  if (!isAdmin && isAtOrderLimit(plan, orderCount ?? 0)) {
    throw new Error(`Limite de pedidos mensais atingido para o plano ${plan}`)
  }

  const total = data.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)

  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: data.customer_id,
      total,
      status: data.status,
      tenant_id: tenantId,
    })
    .select('id')
    .single()

  handleSupabaseError(orderError, 'createOrder:insertOrder', { tenantId, data: { customer_id: data.customer_id, total: data.total } })
  const orderId = orderData!.id

  // Validação pós-insert: detecta race condition onde duas requisições simultâneas
  // passaram na checagem pré-insert mas ambas conseguiram inserir
  const { count: newOrderCount } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .gte('created_at', curMonthStart)

  if (!isAdmin && (newOrderCount ?? 0) > getPlanLimits(plan).maxOrdersPerMonth) {
    await supabase.from('orders').delete().eq('id', orderId).eq('tenant_id', tenantId)
    throw new Error(`Limite de pedidos mensais atingido para o plano ${plan}`)
  }

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
  const validStatus = orderStatusSchema.parse(status)
  const supabase = createClient()
  const tenantId = await getTenantId()

  const { data: currentOrder } = await supabase
    .from('orders')
    .select('status, total, customers(name)')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single()

  const { error } = await supabase
    .from('orders')
    .update({ status: validStatus })
    .eq('id', id)
    .eq('tenant_id', tenantId)
  handleSupabaseError(error, 'updateOrderStatus', { tenantId, orderId: id, status: validStatus })

  const wasFinalized = currentOrder?.status === 'Finalizado'
  const isNowFinalized = validStatus === 'Finalizado'

  if (isNowFinalized && !wasFinalized) {
    const customerName = (currentOrder?.customers as unknown as { name: string } | null)?.name ?? 'Cliente'
    const { error: revenueError } = await supabase.from('revenue_entries').insert({
      tenant_id: tenantId,
      date: new Date().toISOString().split('T')[0],
      description: `Pedido #${id.substring(0, 6)} — ${customerName}`,
      quantity: 1,
      unit_price: currentOrder!.total,
      total: currentOrder!.total,
      order_id: id,
    })
    handleSupabaseError(revenueError, 'updateOrderStatus:createRevenue', { tenantId, orderId: id })
  } else if (!isNowFinalized && wasFinalized) {
    await supabase.from('revenue_entries').delete().eq('order_id', id).eq('tenant_id', tenantId)
  }

  revalidatePath('/dashboard/pedidos')
  revalidatePath('/dashboard/entradas')
  revalidatePath('/dashboard/financeiro')
}

export async function deleteOrder(id: string) {
  const supabase = createClient()
  const tenantId = await getTenantId()

  // Busca customer_id antes de deletar para atualizar stats depois
  const { data: order } = await supabase
    .from('orders')
    .select('customer_id')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single()

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

  if (order?.customer_id) {
    const { updateCustomerStats } = await import('@/app/actions/customers')
    await updateCustomerStats(order.customer_id)
  }

  revalidatePath('/dashboard/pedidos')
  revalidatePath('/dashboard/entradas')
  revalidatePath('/dashboard/financeiro')
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
