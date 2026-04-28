import { useQuery } from '@tanstack/react-query'
import { getCustomerOrders } from '@/app/actions/customers'

export function useCustomerOrders(customerId?: string) {
  return useQuery({
    queryKey: ['customer_orders', customerId],
    enabled: !!customerId,
    queryFn: () => getCustomerOrders(customerId!),
  })
}
