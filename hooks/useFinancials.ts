import { useQuery } from '@tanstack/react-query'
import { getMonthSummary, getTransactions, getFinancialSummary } from '@/app/actions/transactions'

export function useFinancials() {
  return useQuery({
    queryKey: ['financials'],
    queryFn: async () => {
      const today = new Date()
      const currentMonth = today.getMonth() + 1
      const currentYear = today.getFullYear()

      const [summary, monthlySummary, recentTransactions] = await Promise.all([
        getFinancialSummary(),
        getMonthSummary(currentMonth, currentYear),
        getTransactions(
          new Date(today.getFullYear(), today.getMonth(), 1).toISOString(),
          new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString()
        ),
      ])

      return {
        ...summary,
        monthlySummary,
        recentTransactions,
      }
    },
  })
}
