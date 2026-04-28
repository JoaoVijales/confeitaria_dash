import { useQuery } from '@tanstack/react-query'
import { getStockAlertData } from '@/app/actions/dashboard'

export function useStockAlerts() {
  return useQuery({
    queryKey: ['stock_alerts'],
    queryFn: () => getStockAlertData(),
  })
}
