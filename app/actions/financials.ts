'use server'

import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/tenant'

export async function getFinancialsData() {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const [revenuesResult, expensesResult] = await Promise.all([
    supabase
      .from('revenue_entries')
      .select('total, created_at')
      .eq('tenant_id', tenantId),
    supabase
      .from('expense_entries')
      .select('total, category, created_at')
      .eq('tenant_id', tenantId),
  ])

  if (revenuesResult.error) throw revenuesResult.error
  if (expensesResult.error) throw expensesResult.error

  return {
    revenues: revenuesResult.data,
    expenses: expensesResult.data,
  }
}
