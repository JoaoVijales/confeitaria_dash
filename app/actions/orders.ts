'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// NOTE: This is a simplified createOrder for demonstration.
// In a real app, you'd handle FormData parsing more robustly,
// potentially stringifying/parsing the items array.
export async function createOrder(data: { customer_id: string; items: { product_id: string; quantity: number; unit_price: number; }[]; total: number; status: string }) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  // 1. Create the main order record
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: data.customer_id,
      total: data.total,
      status: data.status,
    })
    .select('id')
    .single()

  if (orderError) throw orderError
  const orderId = orderData.id

  // 2. Create the associated order items
  const orderItems = data.items.map(item => ({
    order_id: orderId,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

  if (itemsError) {
    // If items fail, attempt to roll back the order creation
    await supabase.from('orders').delete().eq('id', orderId)
    throw itemsError
  }

  revalidatePath('/dashboard/pedidos')

  const { updateCustomerStats } = await import('@/app/actions/customers')
  await updateCustomerStats(data.customer_id)
}

export async function updateOrderStatus(id: string, status: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) throw error
  revalidatePath('/dashboard/pedidos')
}

export async function deleteOrder(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  // 1. Delete associated order items first to avoid foreign key violation
  const { error: itemsError } = await supabase.from('order_items').delete().eq('order_id', id)
  if (itemsError) throw itemsError

  // 2. Delete the main order record
  const { error: orderError } = await supabase.from('orders').delete().eq('id', id)
  if (orderError) throw orderError

  revalidatePath('/dashboard/pedidos')
}

export async function getOrders() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data, error } = await supabase
    .from('orders')
    .select('*, customers(name)') // Join with customers table
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getOrderDetails(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data, error } = await supabase
    .from('orders')
    .select('*, customers(name, email), order_items(*, products(name))') // Join all related tables
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}
