'use server'

import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/tenant'

export async function getTransactions(startDate: string, endDate: string) {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const { data: revenues, error: revenuesError } = await supabase
    .from('revenue_entries')
    .select('id, date, description, total')
    .eq('tenant_id', tenantId)
    .gte('date', startDate)
    .lte('date', endDate)

  if (revenuesError) throw revenuesError

  const { data: expenses, error: expensesError } = await supabase
    .from('expense_entries')
    .select('id, date, description, total')
    .eq('tenant_id', tenantId)
    .gte('date', startDate)
    .lte('date', endDate)

  if (expensesError) throw expensesError

  const allTransactions = [
    ...revenues.map(r => ({ ...r, type: 'Receita' })),
    ...expenses.map(e => ({ ...e, type: 'Despesa', total: -e.total })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return allTransactions
}

export async function getMonthSummary(month: number, year: number) {
  const supabase = createClient()
  const tenantId = await getTenantId()
  const { data: monthlyClosure, error } = await supabase
    .from('monthly_closures')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('month', month)
    .eq('year', year)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw error
  }

  return monthlyClosure
}
