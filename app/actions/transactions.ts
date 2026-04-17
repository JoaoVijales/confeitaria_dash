'use server'

import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/tenant'
import { handleSupabaseError } from '@/lib/logger'

export async function getTransactions(startDate: string, endDate: string) {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const { data: revenues, error: revenuesError } = await supabase
    .from('revenue_entries')
    .select('id, date, description, total')
    .eq('tenant_id', tenantId)
    .gte('date', startDate)
    .lte('date', endDate)

  handleSupabaseError(revenuesError, 'getTransactions:revenues', { tenantId, startDate, endDate })

  const { data: expenses, error: expensesError } = await supabase
    .from('expense_entries')
    .select('id, date, description, total, category')
    .eq('tenant_id', tenantId)
    .gte('date', startDate)
    .lte('date', endDate)

  handleSupabaseError(expensesError, 'getTransactions:expenses', { tenantId, startDate, endDate })

  const allTransactions = [
    ...(revenues ?? []).map(r => ({ ...r, type: 'Receita' as const, category: null })),
    ...(expenses ?? []).map(e => ({ ...e, type: 'Despesa' as const, total: -e.total })),
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
    handleSupabaseError(error, 'getMonthSummary', { tenantId, month, year })
  }

  return monthlyClosure
}

export async function getFinancialSummary() {
  const supabase = createClient()
  const tenantId = await getTenantId()

  const { data: allRevenues, error: revenuesError } = await supabase
    .from('revenue_entries')
    .select('total, created_at')
    .eq('tenant_id', tenantId)

  handleSupabaseError(revenuesError, 'getFinancialSummary:revenues', { tenantId })

  const { data: allExpenses, error: expensesError } = await supabase
    .from('expense_entries')
    .select('total, category, created_at')
    .eq('tenant_id', tenantId)

  handleSupabaseError(expensesError, 'getFinancialSummary:expenses', { tenantId })

  const totalRevenue = (allRevenues ?? []).reduce((acc, e) => acc + e.total, 0)
  const totalExpenses = (allExpenses ?? []).reduce((acc, e) => acc + e.total, 0)
  const netProfit = totalRevenue - totalExpenses
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

  const now = new Date()
  const revenueVsExpensesData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const month = d.getMonth() + 1
    const year = d.getFullYear()
    const monthName = d.toLocaleString('pt-BR', { month: 'short' })

    const monthlyRevenues = (allRevenues ?? [])
      .filter(r => {
        const date = new Date(r.created_at)
        return date.getMonth() + 1 === month && date.getFullYear() === year
      })
      .reduce((sum, r) => sum + r.total, 0)

    const monthlyExpenses = (allExpenses ?? [])
      .filter(e => {
        const date = new Date(e.created_at)
        return date.getMonth() + 1 === month && date.getFullYear() === year
      })
      .reduce((sum, e) => sum + e.total, 0)

    return { name: monthName, Receitas: monthlyRevenues, Despesas: monthlyExpenses }
  })

  const expensesByCategoryChartData = Object.entries(
    (allExpenses ?? []).reduce((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.total
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    revenueVsExpensesData,
    expensesByCategoryChartData,
  }
}
