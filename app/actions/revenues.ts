'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/tenant'
import { revenueSchema } from '@/lib/validations/revenue.schema'
import { handleSupabaseError } from '@/lib/logger'

export async function createRevenue(formData: FormData) {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const data = Object.fromEntries(formData.entries())
  const parsed = revenueSchema.parse({
    ...data,
    quantity: Number(data.quantity),
    unit_price: Number(data.unit_price),
    total: Number(data.total),
  })

  const { error } = await supabase.from('revenue_entries').insert({ ...parsed, tenant_id: tenantId })
  handleSupabaseError(error, 'createRevenue', { tenantId, data: parsed })

  revalidatePath('/dashboard/entradas')
}

export async function updateRevenue(id: string, formData: FormData) {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const data = Object.fromEntries(formData.entries())
  const parsed = revenueSchema.parse({
    ...data,
    quantity: Number(data.quantity),
    unit_price: Number(data.unit_price),
    total: Number(data.total),
  })

  const { error } = await supabase
    .from('revenue_entries')
    .update(parsed)
    .eq('id', id)
    .eq('tenant_id', tenantId)
  handleSupabaseError(error, 'updateRevenue', { tenantId, revenueId: id, data: parsed })

  revalidatePath('/dashboard/entradas')
}

export async function deleteRevenue(id: string) {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const { error } = await supabase
    .from('revenue_entries')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId)
  handleSupabaseError(error, 'deleteRevenue', { tenantId, revenueId: id })

  revalidatePath('/dashboard/entradas')
}

export async function getRevenues() {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const { data, error } = await supabase
    .from('revenue_entries')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('date', { ascending: false })
  handleSupabaseError(error, 'getRevenues', { tenantId })
  return data
}
