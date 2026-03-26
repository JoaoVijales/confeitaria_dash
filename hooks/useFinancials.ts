import { useQuery } from '@tanstack/react-query'
import { getMonthSummary, getTransactions } from '@/app/actions/transactions'
import { getFinancialsData } from '@/app/actions/financials'

export function useFinancials() {
  return useQuery({
    queryKey: ['financials'],
    queryFn: async () => {
      const today = new Date()
      const currentMonth = today.getMonth() + 1
      const currentYear = today.getFullYear()

      const [monthlySummary, financialsData, recentTransactions] = await Promise.all([
        getMonthSummary(currentMonth, currentYear),
        getFinancialsData(),
        getTransactions(
          new Date(today.getFullYear(), today.getMonth(), 1).toISOString(),
          new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString()
        ),
      ])

      const { revenues: allRevenues, expenses: allExpenses } = financialsData

      const totalRevenue = allRevenues.reduce((acc, entry) => acc + entry.total, 0)
      const totalExpenses = allExpenses.reduce((acc, entry) => acc + entry.total, 0)
      const netProfit = totalRevenue - totalExpenses
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

      const revenueVsExpensesData = Array.from({ length: 6 }, (_, i) => {
        const d = new Date()
        d.setMonth(today.getMonth() - (5 - i))
        const month = d.getMonth() + 1
        const year = d.getFullYear()
        const monthName = d.toLocaleString('default', { month: 'short' })

        const monthlyRevenues = allRevenues
          .filter(r => new Date(r.created_at).getMonth() + 1 === month && new Date(r.created_at).getFullYear() === year)
          .reduce((sum, r) => sum + r.total, 0)

        const monthlyExpenses = allExpenses
          .filter(e => new Date(e.created_at).getMonth() + 1 === month && new Date(e.created_at).getFullYear() === year)
          .reduce((sum, e) => sum + e.total, 0)

        return { name: monthName, Receitas: monthlyRevenues, Despesas: monthlyExpenses }
      })

      const expensesByCategoryData = allExpenses.reduce((acc, expense) => {
        if (!acc[expense.category]) acc[expense.category] = 0
        acc[expense.category] += expense.total
        return acc
      }, {} as Record<string, number>)

      const expensesByCategoryChartData = Object.entries(expensesByCategoryData).map(
        ([name, value]) => ({ name, value })
      )

      return {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        monthlySummary,
        revenueVsExpensesData,
        expensesByCategoryChartData,
        recentTransactions,
      }
    },
  })
}
