'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/tenant'
import { productSchema } from '@/lib/validations/product.schema'
import { handleSupabaseError } from '@/lib/logger'

export async function getProducts() {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name')
  handleSupabaseError(error, 'getProducts', { tenantId })
  return data
}

export async function createProduct(formData: FormData) {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const data = Object.fromEntries(formData.entries())
  const parsed = productSchema.parse({
    ...data,
    price: Number(data.price),
    cost: Number(data.cost),
    stock: Number(data.stock),
    min_stock: Number(data.min_stock),
  })

  const { error } = await supabase.from('products').insert({ ...parsed, tenant_id: tenantId })
  handleSupabaseError(error, 'createProduct', { tenantId, data: parsed })

  revalidatePath('/dashboard/produtos')
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = createClient()
  const tenantId = await getTenantId()
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
  handleSupabaseError(error, 'updateProduct', { tenantId, productId: id, data: parsed })

  revalidatePath('/dashboard/produtos')
}

export async function deleteProduct(id: string) {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId)
  handleSupabaseError(error, 'deleteProduct', { tenantId, productId: id })

  revalidatePath('/dashboard/produtos')
}

export async function checkLowStock() {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const { data, error } = await supabase
    .from('products')
    .select('name, stock, min_stock')
    .eq('tenant_id', tenantId)

  handleSupabaseError(error, 'checkLowStock', { tenantId })
  return (data ?? []).filter(p => p.stock < p.min_stock)
}
