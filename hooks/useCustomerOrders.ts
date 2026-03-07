import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export function useCustomerOrders(customerId?: string) {
  return useQuery({
    queryKey: ['customer_orders', customerId],
    enabled: !!customerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(name))')
        .eq('customer_id', customerId!)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
  })
}
