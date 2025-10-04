import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getTransactions } from '@/app/actions/transactions'

const supabase = createClient()

export function useTransactions(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['transactions', startDate, endDate],
    queryFn: () => getTransactions(startDate, endDate),
  })
}
