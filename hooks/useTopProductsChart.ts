import { useQuery } from '@tanstack/react-query'
import { getTopProductsChartData } from '@/app/actions/dashboard'

export function useTopProductsChart() {
  return useQuery({
    queryKey: ['top-products-chart'],
    queryFn: () => getTopProductsChartData(),
  })
}
