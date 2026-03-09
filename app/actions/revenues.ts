'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/tenant'
import { revenueSchema } from '@/lib/validations/revenue.schema'
import { cookies } from 'next/headers'

export async function createRevenue(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const tenantId = await getTenantId(supabase)
  const data = Object.fromEntries(formData.entries())
  const parsed = revenueSchema.parse({
    ...data,
    quantity: Number(data.quantity),
    unit_price: Number(data.unit_price),
    total: Number(data.total),
  })

  const { error } = await supabase.from('revenue_entries').insert({ ...parsed, tenant_id: tenantId })
  if (error) throw error

  revalidatePath('/dashboard/entradas')
}

export async function updateRevenue(id: string, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const tenantId = await getTenantId(supabase)
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
  if (error) throw error

  revalidatePath('/dashboard/entradas')
}

export async function deleteRevenue(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const tenantId = await getTenantId(supabase)
  const { error } = await supabase
    .from('revenue_entries')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId)
  if (error) throw error

  revalidatePath('/dashboard/entradas')
}

export async function getRevenues() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const tenantId = await getTenantId(supabase)
  const { data, error } = await supabase
    .from('revenue_entries')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('date', { ascending: false })
  if (error) throw error
  return data
}
