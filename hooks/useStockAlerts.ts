import { useQuery } from '@tanstack/react-query'
import { getStockAlerts } from '@/app/actions/stock-alerts'

export function useStockAlerts() {
  return useQuery({
    queryKey: ['stock_alerts'],
    queryFn: () => getStockAlerts(),
  })
}
