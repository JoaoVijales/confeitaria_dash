import { useQuery } from '@tanstack/react-query'
import { getSalesChartData } from '@/app/actions/dashboard'

export function useSalesChart() {
  return useQuery({
    queryKey: ['sales-chart'],
    queryFn: () => getSalesChartData(),
  })
}
