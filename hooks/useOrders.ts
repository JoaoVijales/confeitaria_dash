import { useQuery } from '@tanstack/react-query'
import { getOrders } from '@/app/actions/orders'

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => getOrders(),
  })
}