import { useQuery } from '@tanstack/react-query'
import { getTransactions } from '@/app/actions/transactions'


export function useTransactions(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['transactions', startDate, endDate],
    queryFn: () => getTransactions(startDate, endDate),
  })
}
