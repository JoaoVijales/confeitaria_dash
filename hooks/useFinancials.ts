import { useQuery } from '@tanstack/react-query'
import { getMonthSummary, getTransactions, getFinancialSummary } from '@/app/actions/transactions'
import { buildMonthDateRange } from '@/lib/utils/date-range'

export function useFinancials() {
  return useQuery({
    queryKey: ['financials'],
    queryFn: async () => {
      const today = new Date()
      const { curMonthStartDate, curMonthEndDate } = buildMonthDateRange(today)

      const [summary, monthlySummary, recentTransactions] = await Promise.all([
        getFinancialSummary(),
        getMonthSummary(today.getMonth() + 1, today.getFullYear()),
        getTransactions(curMonthStartDate, curMonthEndDate),
      ])

      return {
        ...summary,
        monthlySummary,
        recentTransactions,
      }
    },
  })
}
