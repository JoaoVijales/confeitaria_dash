'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/tenant'
import { productSchema } from '@/lib/validations/product.schema'
import { cookies } from 'next/headers'

export async function getProducts() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const tenantId = await getTenantId(supabase)
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name')
  if (error) throw error
  return data
}

export async function createProduct(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const tenantId = await getTenantId(supabase)
  const data = Object.fromEntries(formData.entries())
  const parsed = productSchema.parse({
    ...data,
    price: Number(data.price),
    cost: Number(data.cost),
    stock: Number(data.stock),
    min_stock: Number(data.min_stock),
  })

  const { error } = await supabase.from('products').insert({ ...parsed, tenant_id: tenantId })
  if (error) throw error

  revalidatePath('/dashboard/produtos')
}

export async function updateProduct(id: string, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const tenantId = await getTenantId(supabase)
  const data = Object.fromEntries(formData.entries())
  const parsed = productSchema.parse({
    ...data,
    price: Number(data.price),
    cost: Number(data.cost),
    stock: Number(data.stock),
    min_stock: Number(data.min_stock),
  })

  const { error } = await supabase
    .from('products')
    .update(parsed)
    .eq('id', id)
    .eq('tenant_id', tenantId)
  if (error) throw error

  revalidatePath('/dashboard/produtos')
}

export async function deleteProduct(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const tenantId = await getTenantId(supabase)
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId)
  if (error) throw error

  revalidatePath('/dashboard/produtos')
}

export async function checkLowStock() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const tenantId = await getTenantId(supabase)
  const { data, error } = await supabase
    .from('products')
    .select('name, stock, min_stock')
    .eq('tenant_id', tenantId)

  if (error) throw error
  return data.filter(p => p.stock < p.min_stock)
}
